package org.example;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assumptions;

import java.io.File;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class ParseScheduleTest {

    // ── parseTimeRange ─────────────────────────────────────────────────────────

    @Test
    void parseTimeRange_singleRange() {
        ParseSchedule.TimeRange[] result = ParseSchedule.parseTimeRange("8:00am-12:30pm");
        assertEquals(1, result.length);
        assertEquals("08:00", result[0].start());
        assertEquals("12:30", result[0].end());
        assertEquals("", result[0].notes());
    }

    @Test
    void parseTimeRange_withLimitedLapLanesMarker() {
        ParseSchedule.TimeRange[] result = ParseSchedule.parseTimeRange("6:30pm-8:00pm**");
        assertEquals(1, result.length);
        assertEquals("18:30", result[0].start());
        assertEquals("20:00", result[0].end());
        assertEquals("Limited Lap Lanes", result[0].notes());
    }

    @Test
    void parseTimeRange_twoRangesNewlineSeparated() {
        ParseSchedule.TimeRange[] result = ParseSchedule.parseTimeRange("7:30am-12:30pm\n6:00pm-8:00pm");
        assertEquals(2, result.length);
        assertEquals("07:30", result[0].start());
        assertEquals("12:30", result[0].end());
        assertEquals("18:00", result[1].start());
        assertEquals("20:00", result[1].end());
    }

    @Test
    void parseTimeRange_emptyString() {
        assertEquals(0, ParseSchedule.parseTimeRange("").length);
    }

    @Test
    void parseTimeRange_nullReturnsEmpty() {
        assertEquals(0, ParseSchedule.parseTimeRange(null).length);
    }

    @Test
    void parseTimeRange_enDashSeparator() {
        // West Campus PDFs use en-dashes
        ParseSchedule.TimeRange[] result = ParseSchedule.parseTimeRange("2:30pm – 4:30pm**");
        assertEquals(1, result.length);
        assertEquals("14:30", result[0].start());
        assertEquals("16:30", result[0].end());
        assertEquals("Limited Lap Lanes", result[0].notes());
    }

    @Test
    void parseTimeRange_threeRanges() {
        String cell = "9:00am-10:00am\n11:00am-1:00pm\n5:00pm-7:00pm**";
        ParseSchedule.TimeRange[] result = ParseSchedule.parseTimeRange(cell);
        assertEquals(3, result.length);
        assertEquals("09:00", result[0].start());
        assertEquals("13:00", result[1].end());
        assertEquals("Limited Lap Lanes", result[2].notes());
    }

    @Test
    void parseTimeRange_repairsSplitLeadingDigit() {
        ParseSchedule.TimeRange[] result = ParseSchedule.parseTimeRange("1 0:00am-11:00am");
        assertEquals(1, result.length);
        assertEquals("10:00", result[0].start());
        assertEquals("11:00", result[0].end());
    }

    // ── to24Hour ───────────────────────────────────────────────────────────────

    @Test
    void to24Hour_morningTime() {
        assertEquals("07:30", ParseSchedule.to24Hour("7:30am"));
    }

    @Test
    void to24Hour_noon() {
        assertEquals("12:00", ParseSchedule.to24Hour("12:00pm"));
    }

    @Test
    void to24Hour_midnight() {
        assertEquals("00:00", ParseSchedule.to24Hour("12:00am"));
    }

    @Test
    void to24Hour_eveningTime() {
        assertEquals("18:00", ParseSchedule.to24Hour("6:00pm"));
    }

    @Test
    void to24Hour_withSpaces() {
        assertEquals("19:00", ParseSchedule.to24Hour("7:00 PM"));
    }

    // ── parseMonthDay ──────────────────────────────────────────────────────────

    @Test
    void parseMonthDay_standard() {
        assertEquals("2026-03-30", ParseSchedule.parseMonthDay("March 30", 2026));
    }

    @Test
    void parseMonthDay_mayHoliday() {
        assertEquals("2026-05-18", ParseSchedule.parseMonthDay("May 18", 2026));
    }

    @Test
    void parseMonthDay_june() {
        assertEquals("2026-06-06", ParseSchedule.parseMonthDay("June 6", 2026));
    }

    @Test
    void parseMonthDay_invalidReturnsNull() {
        assertNull(ParseSchedule.parseMonthDay("Not a date", 2026));
    }

    // ── metadata extraction ─────────────────────────────────────────────────────

    @Test
    void parseSeason_fragmentedKingTitle() {
        assertArrayEquals(
            new String[]{"2026-03-02", "2026-06-07"},
            ParseSchedule.parseSeason("KING POOL S PRING SCHED ULE (MA RCH 2 – JUNE 7)", 2026)
        );
    }

    @Test
    void parseSeason_fragmentedWestTitle() {
        assertArrayEquals(
            new String[]{"2026-04-06", "2026-06-07"},
            ParseSchedule.parseSeason("WE ST CAM PUS PO OL SCHE DULE (A PRIL 6 – JUNE 7)", 2026)
        );
    }

    @Test
    void extractPoolInfo_usesFullFallbackAddressWhenPdfTextIsTruncated() {
        String[] king = ParseSchedule.extractPoolInfo(
            "king",
            "King Pool (1700 Hopkins St.): 510-981-5105"
        );
        assertEquals("King Pool", king[0]);
        assertEquals("1700 Hopkins St., Berkeley, CA 94707", king[1]);
        assertEquals("510-981-5105", king[2]);

        String[] west = ParseSchedule.extractPoolInfo(
            "west",
            "West Campus Pool (2100 Browning St.): 510-981-5125"
        );
        assertEquals("West Campus Pool", west[0]);
        assertEquals("2100 Browning St., Berkeley, CA 94707", west[1]);
        assertEquals("510-981-5125", west[2]);
    }

    // ── positioned text extraction ──────────────────────────────────────────────

    @Test
    void splitGlyphsIntoColumnChunks_keepsBoundaryTimeTokenInOneDayColumn() {
        float[] starts = {0f, 160.1f, 250.6f, 332.9f, 427.0f, 526.9f, 607.1f, 702.2f};
        List<ParseSchedule.Glyph> glyphs = new ArrayList<>();
        glyphs.addAll(glyphsFor("8:00am-12:00pm", 594.8f, 158.2f));
        glyphs.addAll(glyphsFor("11:00am-12:00pm**", 681.0f, 158.2f));

        List<ParseSchedule.TextChunk> chunks = new ArrayList<>();
        ParseSchedule.splitGlyphsIntoColumnChunks(glyphs, starts, chunks);

        Map<Integer, String> byCol = new HashMap<>();
        for (ParseSchedule.TextChunk chunk : chunks) {
            byCol.put(chunk.col(), chunk.text());
        }
        assertEquals("8:00am-12:00pm", byCol.get(6));
        assertEquals("11:00am-12:00pm**", byCol.get(7));
    }

    // ── local PDF regressions ───────────────────────────────────────────────────

    @Test
    void parseKingPdf_regressionRowsMatchExpectedOutput() throws Exception {
        File pdf = samplePdf("King Pool Schedule Spring 2026 3.2-6.7.pdf");
        Assumptions.assumeTrue(pdf.exists(), "sample PDF not present");

        ObjectNode root = ParseSchedule.parsePool("king", pdf);
        assertEquals("1700 Hopkins St., Berkeley, CA 94707", root.at("/pool/address").asText());
        assertEquals("2026-03-02", root.at("/season/valid_from").asText());
        assertEquals("2026-06-07", root.at("/season/valid_through").asText());
        assertHasClosure(root, "2026-03-30", "City holiday");
        assertHasClosure(root, "2026-06-06", "Pre-Summer Staff Training");

        assertHasScheduleEntry(root, "Sunday", "Lap Swim", "11:00", "12:00");
        assertNoScheduleEntry(root, "Sunday", "Lap Swim", "01:00", "12:00");
        assertHasScheduleEntry(root, "Monday", "Berkeley Aquatic Masters", "06:00", "07:30");
        assertHasScheduleEntry(root, "Monday", "Berkeley Aquatic Masters", "06:00", "12:30");
        assertNoActivity(root, "Berkeley Aquatic");
        assertNoActivity(root, "Masters");

        assertHasScheduleEntry(root, "Monday", "Family Swim", "08:00", "12:30");
        assertHasScheduleEntry(root, "Monday", "Family Swim", "18:00", "20:00");
        assertNoScheduleEntry(root, "Monday", "Swim Lessons", "08:00", "12:30");
    }

    @Test
    void parseWestPdf_regressionRowsMatchExpectedOutput() throws Exception {
        File pdf = samplePdf("West Campus Pool Schedule Spring 2026 4.6 -6.7.pdf");
        Assumptions.assumeTrue(pdf.exists(), "sample PDF not present");

        ObjectNode root = ParseSchedule.parsePool("west", pdf);
        assertEquals("2100 Browning St., Berkeley, CA 94707", root.at("/pool/address").asText());
        assertEquals("2026-04-06", root.at("/season/valid_from").asText());
        assertEquals("2026-06-07", root.at("/season/valid_through").asText());
        assertHasClosure(root, "2026-05-18", "City holiday");
        assertHasClosure(root, "2026-06-07", "Pre-Summer Staff Training");

        assertHasScheduleEntry(root, "Friday", "Lap Swim", "09:00", "10:00");
        assertHasScheduleEntry(root, "Friday", "Lap Swim", "11:00", "13:00");
        assertHasScheduleEntry(root, "Monday", "Senior Exercise", "10:00", "11:00");
        assertNoScheduleEntry(root, "Friday", "Lap Swim", "01:00", "13:00");
        assertNoScheduleEntry(root, "Monday", "Senior Exercise", "00:00", "11:00");

        assertHasScheduleEntry(root, "Monday", "Independent Exercise", "09:00", "13:00");
        assertNoScheduleEntry(root, "Monday", "Swim Lessons", "09:00", "13:00");
        assertHasScheduleEntry(root, "Friday", "Family Swim", "09:00", "13:00");
        assertHasScheduleEntry(root, "Friday", "Family Swim", "17:00", "19:00");
    }

    private static List<ParseSchedule.Glyph> glyphsFor(String text, float x, float y) {
        List<ParseSchedule.Glyph> glyphs = new ArrayList<>();
        float cursor = x;
        for (int i = 0; i < text.length(); i++) {
            glyphs.add(new ParseSchedule.Glyph(String.valueOf(text.charAt(i)), cursor, y, 3.5f));
            cursor += 4f;
        }
        return glyphs;
    }

    private static File samplePdf(String fileName) {
        List<File> candidates = List.of(
            new File("samples", fileName),
            new File("../samples", fileName),
            new File("parser/samples", fileName)
        );
        for (File candidate : candidates) {
            if (candidate.exists()) return candidate;
        }
        return candidates.get(0);
    }

    private static void assertHasClosure(ObjectNode root, String date, String reason) {
        for (JsonNode closure : root.withArray("closures")) {
            if (closure.path("date").asText().equals(date)
                    && closure.path("reason").asText().equals(reason)) {
                return;
            }
        }
        fail("Expected closure " + date + " / " + reason);
    }

    private static void assertHasScheduleEntry(
            ObjectNode root, String day, String activity, String start, String end) {
        assertTrue(hasScheduleEntry(root, day, activity, start, end),
            "Expected schedule entry " + day + " / " + activity + " / " + start + "-" + end);
    }

    private static void assertNoScheduleEntry(
            ObjectNode root, String day, String activity, String start, String end) {
        assertFalse(hasScheduleEntry(root, day, activity, start, end),
            "Unexpected schedule entry " + day + " / " + activity + " / " + start + "-" + end);
    }

    private static boolean hasScheduleEntry(
            ObjectNode root, String day, String activity, String start, String end) {
        for (JsonNode entry : root.withArray("schedule")) {
            if (entry.path("day").asText().equals(day)
                    && entry.path("activity").asText().equals(activity)
                    && entry.path("start").asText().equals(start)
                    && entry.path("end").asText().equals(end)) {
                return true;
            }
        }
        return false;
    }

    private static void assertNoActivity(ObjectNode root, String activity) {
        for (JsonNode entry : root.withArray("schedule")) {
            assertNotEquals(activity, entry.path("activity").asText());
        }
    }
}
