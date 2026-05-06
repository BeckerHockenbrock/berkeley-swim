package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;

import java.io.*;
import java.util.*;
import java.util.regex.*;

/**
 * Parses Berkeley pool schedule PDFs into structured JSON.
 *
 * PDFBox outputs entire table rows as single text runs, so plain text
 * extraction loses column boundaries. This parser uses a two-phase approach:
 *   Phase 1 — collect raw TextPosition lists from each writeString call and
 *              derive column X boundaries from the header row.
 *   Phase 2 — re-assign every character to its day column by X position,
 *              producing per-column TextChunks for clean table parsing.
 */
public class ParseSchedule {

    static final String[] DAYS = {
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    };
    static final String[] DAYS_UPPER = {
        "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
    };
    static final float WORD_GAP_PT = 5f;

    // ── Inner types ────────────────────────────────────────────────────────────

    record TextChunk(String text, float x, float y, int col) {
        TextChunk(String text, float x, float y) {
            this(text, x, y, -1);
        }
    }

    record Glyph(String text, float x, float y, float width) {
        float right() {
            return x + Math.max(width, 0f);
        }
    }

    record WordToken(String text, float x, float y, float right) {
        float center() {
            return (x + right) / 2f;
        }
    }

    record RowInfo(
        int index,
        float y,
        String col0Text,
        Map<Integer, List<String>> dayTexts,
        Map<Integer, List<String>> timeTexts,
        boolean hasDayData,
        boolean isActivityName,
        boolean isFooter
    ) {}

    /** A parsed time range from one schedule cell. */
    public record TimeRange(String start, String end, String notes) {}

    // ── Text extraction (two-phase) ────────────────────────────────────────────

    /**
     * Phase 1: collect one List<TextPosition> per writeString call.
     * Phase 2: derive column starts from the header call, then split every
     *          call into per-column TextChunks using character X coordinates.
     *
     * Also returns the basic PDFTextStripper output via fullTextOut
     * (used for metadata like closures, address, last-revised date).
     */
    static List<TextChunk> extractChunks(PDDocument doc, StringBuilder fullTextOut) throws IOException {
        List<List<TextPosition>> allPositionLists = new ArrayList<>();

        PDFTextStripper stripper = new PDFTextStripper() {
            @Override
            protected void writeString(String text, List<TextPosition> positions) throws IOException {
                super.writeString(text, positions); // keeps basic text output intact
                if (!positions.isEmpty() && !text.isBlank()) {
                    allPositionLists.add(new ArrayList<>(positions));
                }
            }
        };
        stripper.setSortByPosition(true);
        String rawText = stripper.getText(doc);
        if (fullTextOut != null) fullTextOut.append(rawText);

        // Derive column X starts from the header row
        float[] colStarts = deriveColumnStarts(allPositionLists);

        // Split every call into per-column chunks
        List<TextChunk> result = new ArrayList<>();
        for (List<TextPosition> positions : allPositionLists) {
            splitIntoColumnChunks(positions, colStarts, result);
        }
        return result;
    }

    /**
     * Finds the writeString call containing MONDAY…SUNDAY and extracts the
     * X start position of each day column from character-level TextPositions.
     */
    private static float[] deriveColumnStarts(List<List<TextPosition>> allPositions) {
        for (List<TextPosition> positions : allPositions) {
            StringBuilder sb = new StringBuilder();
            for (TextPosition tp : positions) {
                if (tp.getUnicode() != null) sb.append(tp.getUnicode());
            }
            String text = sb.toString().toUpperCase();
            if (!text.contains("MONDAY") || !text.contains("SUNDAY")) continue;

            float[] starts = new float[8]; // [0]=PROGRAMS, [1]=MON … [7]=SUN
            // Walk characters simultaneously to find each day name's start X
            int charIdx = 0;
            for (TextPosition tp : positions) {
                String uni = tp.getUnicode();
                if (uni == null) continue;
                for (int d = 0; d < DAYS_UPPER.length; d++) {
                    if (text.startsWith(DAYS_UPPER[d], charIdx)) {
                        starts[d + 1] = tp.getXDirAdj();
                    }
                }
                charIdx += uni.length();
            }
            return starts;
        }
        throw new IllegalStateException("Header row with MONDAY…SUNDAY not found in PDF");
    }

    /**
     * Groups all TextPositions from one writeString call into per-column tokens.
     * Characters are assigned to a column by their X position using colOf().
     * The resulting TextChunks record the X of the first character in each column.
     */
    private static void splitIntoColumnChunks(
            List<TextPosition> positions, float[] colStarts, List<TextChunk> out) {
        List<Glyph> glyphs = new ArrayList<>();
        for (TextPosition tp : positions) {
            String uni = tp.getUnicode();
            if (uni != null) {
                glyphs.add(new Glyph(uni, tp.getXDirAdj(), tp.getYDirAdj(), tp.getWidthDirAdj()));
            }
        }
        splitGlyphsIntoColumnChunks(glyphs, colStarts, out);
    }

    static void splitGlyphsIntoColumnChunks(
            List<Glyph> glyphs, float[] colStarts, List<TextChunk> out) {
        Map<Integer, StringBuilder> texts  = new TreeMap<>();
        Map<Integer, Float>         xFirst = new TreeMap<>();
        Map<Integer, Float>         yFirst = new TreeMap<>();

        for (WordToken word : groupIntoWords(glyphs, WORD_GAP_PT)) {
            int col = colOf(word.center(), colStarts);
            texts .computeIfAbsent(col, k -> new StringBuilder());
            xFirst.putIfAbsent(col, word.x());
            yFirst.putIfAbsent(col, word.y());
            StringBuilder sb = texts.get(col);
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(word.text());
        }

        for (Map.Entry<Integer, StringBuilder> e : texts.entrySet()) {
            int    col  = e.getKey();
            String text = e.getValue().toString().strip();
            if (!text.isBlank()) {
                out.add(new TextChunk(text, xFirst.get(col), yFirst.get(col), col));
            }
        }
    }

    static List<WordToken> groupIntoWords(List<Glyph> glyphs, float maxGap) {
        List<WordToken> words = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        float wordX = 0f;
        float wordY = 0f;
        float prevRight = 0f;
        boolean hasCurrent = false;

        for (Glyph glyph : glyphs) {
            String text = glyph.text();
            if (text == null || text.isBlank()) {
                if (hasCurrent) {
                    words.add(new WordToken(current.toString(), wordX, wordY, prevRight));
                    current.setLength(0);
                    hasCurrent = false;
                }
                continue;
            }

            float x = glyph.x();
            float right = Math.max(glyph.right(), x);
            boolean startsNewWord = !hasCurrent
                || x - prevRight > maxGap
                || x + 1f < wordX;

            if (startsNewWord) {
                if (hasCurrent) {
                    words.add(new WordToken(current.toString(), wordX, wordY, prevRight));
                    current.setLength(0);
                }
                wordX = x;
                wordY = glyph.y();
                prevRight = right;
                hasCurrent = true;
            } else {
                prevRight = Math.max(prevRight, right);
            }
            current.append(text);
        }

        if (hasCurrent) {
            words.add(new WordToken(current.toString(), wordX, wordY, prevRight));
        }
        return words;
    }

    /** Groups chunks into rows by Y coordinate (within 4 pt). Each row sorted by X. */
    static List<List<TextChunk>> groupByRow(List<TextChunk> chunks) {
        List<TextChunk> sorted = new ArrayList<>(chunks);
        sorted.sort(Comparator.comparingDouble(TextChunk::y));

        List<List<TextChunk>> rows = new ArrayList<>();
        List<TextChunk> current   = null;
        float lastY = Float.MIN_VALUE;

        for (TextChunk c : sorted) {
            if (current == null || Math.abs(c.y() - lastY) > 4f) {
                current = new ArrayList<>();
                rows.add(current);
                lastY = c.y();
            }
            current.add(c);
        }
        for (List<TextChunk> row : rows) row.sort(Comparator.comparingDouble(TextChunk::x));
        return rows;
    }

    /**
     * Finds the header row among grouped chunks and returns column X starts.
     * Works on the already-split chunks (each day-name word is its own chunk).
     */
    static float[] findColumnStarts(List<List<TextChunk>> rows) {
        for (List<TextChunk> row : rows) {
            String joined = row.stream()
                .map(c -> c.text().toUpperCase())
                .reduce("", (a, b) -> a + " " + b);
            if (!joined.contains("MONDAY") || !joined.contains("SUNDAY")) continue;

            float[] starts = new float[8];
            for (TextChunk c : row) {
                String up = c.text().toUpperCase().trim();
                for (int i = 0; i < DAYS_UPPER.length; i++) {
                    if (up.equals(DAYS_UPPER[i])) starts[i + 1] = c.x();
                }
            }
            return starts;
        }
        throw new IllegalStateException("Header row not found in grouped chunks");
    }

    /**
     * Returns which column (0=programs, 1=Mon … 7=Sun) a chunk at x belongs to.
     * 20 pt tolerance accounts for data cells positioned slightly left of column headers.
     */
    static int colOf(float x, float[] starts) {
        int col = 0;
        for (int i = 1; i < starts.length; i++) {
            if (x >= starts[i] - 20f) col = i;
        }
        return col;
    }

    // ── Time parsing ───────────────────────────────────────────────────────────

    // Matches "8:00am-12:30pm", "8:00am – 12:30pm**", "9:00am -10:00am"
    static final Pattern TIME_RANGE_PAT = Pattern.compile(
        "(\\d{1,2}:\\d{2}\\s*[aApP][mM])\\s*[-–—]\\s*(\\d{1,2}:\\d{2}\\s*[aApP][mM])(\\*+)?",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Parses one or more time ranges from a cell string.
     * Handles multiple ranges (newline-separated), en-dashes, and ** markers.
     */
    public static TimeRange[] parseTimeRange(String cell) {
        if (cell == null || cell.isBlank()) return new TimeRange[0];
        cell = cell.replaceAll("(?<=\\d)\\s+(?=\\d{1,2}:\\d{2}\\s*[aApP][mM])", "");
        List<TimeRange> out = new ArrayList<>();
        Matcher m = TIME_RANGE_PAT.matcher(cell);
        while (m.find()) {
            String start = to24Hour(m.group(1));
            String end   = to24Hour(m.group(2));
            String notes = (m.group(3) != null && !m.group(3).isEmpty())
                           ? "Limited Lap Lanes" : "";
            out.add(new TimeRange(start, end, notes));
        }
        return out.toArray(new TimeRange[0]);
    }

    /** Converts "7:30am" / "6:00 PM" → "07:30" / "18:00" (24-hour). */
    public static String to24Hour(String t) {
        t = t.trim().toLowerCase().replaceAll("\\s+", "");
        boolean pm = t.endsWith("pm");
        t = t.replace("am", "").replace("pm", "");
        String[] p = t.split(":");
        int h = Integer.parseInt(p[0]);
        int m = Integer.parseInt(p[1]);
        if (pm && h != 12) h += 12;
        if (!pm && h == 12) h = 0;
        return String.format("%02d:%02d", h, m);
    }

    // ── Date parsing ───────────────────────────────────────────────────────────

    static final Map<String, Integer> MONTH_MAP = new LinkedHashMap<>();
    static {
        String[] ns = {"january","february","march","april","may","june",
                       "july","august","september","october","november","december"};
        for (int i = 0; i < ns.length; i++) MONTH_MAP.put(ns[i], i + 1);
    }

    /** "March 30" → "2026-03-30"; returns null if unparseable. */
    public static String parseMonthDay(String s, int year) {
        Matcher m = Pattern.compile("([A-Za-z]+)\\s+(\\d{1,2})").matcher(s.trim());
        if (m.find()) {
            Integer month = MONTH_MAP.get(m.group(1).toLowerCase());
            if (month != null)
                return String.format("%d-%02d-%02d", year, month, Integer.parseInt(m.group(2)));
        }
        return null;
    }

    /** "MARCH 2 – JUNE 7" → ["2026-03-02", "2026-06-07"]. */
    static String[] parseSeason(String title, int year) {
        String monthNames = "JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER";
        String normalized = compactText(title).toUpperCase();
        Matcher m = Pattern.compile(
            "(" + monthNames + ")(\\d{1,2})[–—-]+(" + monthNames + ")(\\d{1,2})"
        ).matcher(normalized);
        if (m.find()) {
            Integer m1 = MONTH_MAP.get(m.group(1).toLowerCase());
            Integer m2 = MONTH_MAP.get(m.group(3).toLowerCase());
            if (m1 != null && m2 != null) {
                return new String[]{
                    String.format("%d-%02d-%02d", year, m1, Integer.parseInt(m.group(2))),
                    String.format("%d-%02d-%02d", year, m2, Integer.parseInt(m.group(4)))
                };
            }
        }
        return null;
    }

    // ── Document parsing ───────────────────────────────────────────────────────

    /** Full parse pipeline: PDF file → structured JSON ObjectNode. */
    public static ObjectNode parsePool(String poolId, File pdfFile) throws Exception {
        if (!pdfFile.exists())
            throw new FileNotFoundException("PDF not found: " + pdfFile.getAbsolutePath());
        try (PDDocument doc = Loader.loadPDF(pdfFile)) {
            return parseDocument(poolId, doc);
        }
    }

    static ObjectNode parseDocument(String poolId, PDDocument doc) throws IOException {
        StringBuilder fullTextSB = new StringBuilder();
        List<TextChunk>        chunks = extractChunks(doc, fullTextSB);
        List<List<TextChunk>>  rows   = groupByRow(chunks);
        float[]                colStarts = findColumnStarts(rows);
        String                 fullText  = fullTextSB.toString();

        // Find header row index
        int headerIdx = -1;
        for (int i = 0; i < rows.size(); i++) {
            String joined = rows.get(i).stream()
                .map(c -> c.text().toUpperCase())
                .reduce("", (a, b) -> a + " " + b);
            if (joined.contains("MONDAY") && joined.contains("SUNDAY")) {
                headerIdx = i;
                break;
            }
        }
        if (headerIdx < 0) throw new IllegalStateException("Header row not found");

        // Find title row (contains SCHEDULE, before header)
        String titleLine = "";
        for (int i = 0; i < headerIdx && titleLine.isEmpty(); i++) {
            String rowText = rowText(rows.get(i));
            if (compactText(rowText).toUpperCase().contains("SCHEDULE")) {
                titleLine = rowText;
            }
        }

        // Metadata from full text
        int year = guessYear(titleLine.isEmpty() ? fullText : titleLine);
        String[] seasonDates  = parseSeason(titleLine, year);
        String   seasonLabel  = extractSeasonLabel(titleLine, year);
        String[] poolInfo     = extractPoolInfo(poolId, fullText);
        String   lastUpdated  = extractLastRevised(fullText, year);
        List<Map<String, String>> closures = extractClosures(fullText, rows, year);

        // ── Parse schedule table ───────────────────────────────────────────────
        // activity → day → ordered list of raw time-range strings
        Map<String, Map<String, List<String>>> schedule = new LinkedHashMap<>();

        List<RowInfo> tableRows = new ArrayList<>();
        for (int ri = headerIdx + 1; ri < rows.size(); ri++) {
            RowInfo info = classifyRow(ri, rows.get(ri), colStarts);
            if (info.isFooter()) break;
            tableRows.add(info);
        }

        String currentActivity = null;
        boolean currentNameRowHadNoDayData = false;
        float currentLastY = Float.NaN;
        Map<String, List<String>> pendingDayData = initDayMap();

        for (int i = 0; i < tableRows.size(); i++) {
            RowInfo row = tableRows.get(i);

            if (row.isActivityName()) {
                boolean mergeName = !row.hasDayData()
                    && currentActivity != null
                    && currentNameRowHadNoDayData;

                if (mergeName) {
                    String oldName = currentActivity;
                    currentActivity = oldName + " " + row.col0Text();
                    Map<String, List<String>> existing = schedule.remove(oldName);
                    schedule.put(currentActivity, existing != null ? existing : initDayMap());
                } else {
                    currentActivity = row.col0Text();
                    schedule.put(currentActivity, pendingDayData);
                    pendingDayData = initDayMap();
                }

                currentNameRowHadNoDayData = !row.hasDayData();
                currentLastY = row.y();
                appendDayData(schedule.get(currentActivity), row);
                if (row.hasDayData()) currentLastY = row.y();
                continue;
            }

            if (!row.hasDayData()) continue;

            boolean attachToNext = false;
            if (currentActivity == null) {
                attachToNext = true;
            } else if (!currentNameRowHadNoDayData) {
                RowInfo nextActivity = nextActivityAfter(tableRows, i);
                if (nextActivity != null && !Float.isNaN(currentLastY)) {
                    float distanceToPrevious = Math.abs(row.y() - currentLastY);
                    float distanceToNext = Math.abs(nextActivity.y() - row.y());
                    attachToNext = distanceToNext < distanceToPrevious;
                }
            }

            if (attachToNext) {
                appendDayData(pendingDayData, row);
            } else {
                appendDayData(schedule.get(currentActivity), row);
                currentLastY = row.y();
            }
        }

        // ── Build JSON ─────────────────────────────────────────────────────────
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode   root   = mapper.createObjectNode();

        ObjectNode poolNode = root.putObject("pool");
        poolNode.put("id",      poolId);
        poolNode.put("name",    poolInfo[0]);
        poolNode.put("address", poolInfo[1]);
        poolNode.put("phone",   poolInfo[2]);

        ObjectNode seasonNode = root.putObject("season");
        seasonNode.put("label", seasonLabel);
        if (seasonDates != null) {
            seasonNode.put("valid_from",    seasonDates[0]);
            seasonNode.put("valid_through", seasonDates[1]);
        }

        root.put("last_updated", lastUpdated);

        ArrayNode closuresNode = root.putArray("closures");
        for (Map<String, String> c : closures) {
            closuresNode.addObject()
                .put("date",   c.get("date"))
                .put("reason", c.get("reason"));
        }

        ArrayNode schedNode = root.putArray("schedule");
        for (Map.Entry<String, Map<String, List<String>>> actEntry : schedule.entrySet()) {
            String activity = actEntry.getKey();
            for (String day : DAYS) {
                List<String> timeStrs = actEntry.getValue().get(day);
                if (timeStrs == null || timeStrs.isEmpty()) continue;
                String cellText = String.join("\n", timeStrs);
                for (TimeRange tr : parseTimeRange(cellText)) {
                    ObjectNode entry = schedNode.addObject();
                    entry.put("day",      day);
                    entry.put("activity", activity);
                    entry.put("start",    tr.start());
                    entry.put("end",      tr.end());
                    entry.put("notes",    tr.notes());
                }
            }
        }

        return root;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static Map<String, List<String>> initDayMap() {
        Map<String, List<String>> m = new LinkedHashMap<>();
        for (String day : DAYS) m.put(day, new ArrayList<>());
        return m;
    }

    static RowInfo classifyRow(int index, List<TextChunk> row, float[] colStarts) {
        Map<Integer, List<String>> dayTexts = new TreeMap<>();
        Map<Integer, List<String>> timeTexts = new TreeMap<>();
        List<String> col0 = new ArrayList<>();
        float y = row.isEmpty() ? 0f : row.get(0).y();

        for (TextChunk c : row) {
            int col = chunkCol(c, colStarts);
            if (col == 0) {
                col0.add(c.text());
            } else if (col >= 1 && col <= 7) {
                dayTexts.computeIfAbsent(col, k -> new ArrayList<>()).add(c.text());
                if (looksLikeTimeRange(c.text())) {
                    timeTexts.computeIfAbsent(col, k -> new ArrayList<>()).add(c.text());
                }
            }
        }

        String col0Text = String.join(" ", col0).trim();
        String dayText = dayTexts.values().stream()
            .flatMap(List::stream)
            .reduce("", (a, b) -> a + " " + b)
            .trim();
        boolean hasDayData = !timeTexts.isEmpty();
        boolean isFooter = isFooterText(col0Text) || isFooterText(dayText);
        boolean isActivityName = !isFooter
            && !col0Text.isBlank()
            && !looksLikeTimeRange(col0Text)
            && !col0Text.startsWith("(")
            && !col0Text.startsWith("w/");

        return new RowInfo(index, y, col0Text, dayTexts, timeTexts, hasDayData, isActivityName, isFooter);
    }

    private static int chunkCol(TextChunk c, float[] colStarts) {
        return c.col() >= 0 ? c.col() : colOf(c.x(), colStarts);
    }

    private static RowInfo nextActivityAfter(List<RowInfo> rows, int index) {
        for (int i = index + 1; i < rows.size(); i++) {
            if (rows.get(i).isActivityName()) return rows.get(i);
        }
        return null;
    }

    private static void appendDayData(Map<String, List<String>> target, RowInfo row) {
        if (target == null) return;
        for (Map.Entry<Integer, List<String>> e : row.timeTexts().entrySet()) {
            int col = e.getKey();
            if (col < 1 || col > 7) continue;
            String dayName = DAYS[col - 1];
            target.get(dayName).addAll(e.getValue());
        }
    }

    private static String rowText(List<TextChunk> row) {
        return row.stream()
            .sorted(Comparator.comparingDouble(TextChunk::x))
            .map(TextChunk::text)
            .reduce("", (a, b) -> a + " " + b)
            .trim();
    }

    private static String rowsText(List<List<TextChunk>> rows) {
        StringBuilder sb = new StringBuilder();
        for (List<TextChunk> row : rows) {
            if (!sb.isEmpty()) sb.append('\n');
            sb.append(rowText(row));
        }
        return sb.toString();
    }

    static String compactText(String text) {
        if (text == null) return "";
        return text.replaceAll("\\s+", "");
    }

    static boolean looksLikeTimeRange(String text) {
        return TIME_RANGE_PAT.matcher(text).find();
    }

    static boolean isFooterText(String text) {
        String up = text.trim().toUpperCase();
        String compact = compactText(up);
        if (up.isEmpty()) return false;
        return up.startsWith("**LIMITED LAP LANES")
            || compact.startsWith("**LIMITEDLAPLANES")
            || up.contains("CITY OF BERKELEY AQUATICS")
            || up.startsWith("LAST REVISED")
            || up.contains("IMPORTANT NOTES")
            || compact.contains("IMPORTANTNOTES")
            || up.contains("MUST PAY AHEAD")
            || compact.contains("MUSTPAYAHEAD")
            || up.startsWith("PAY ONLINE")
            || compact.startsWith("PAYONLINE")
            || up.startsWith("PAY IN-PERSON")
            || compact.startsWith("PAYIN-PERSON")
            || (up.contains("POOL (") && up.contains("510-") && up.contains("ST."));
    }

    static int guessYear(String text) {
        Matcher m = Pattern.compile("\\b(20\\d{2})\\b").matcher(text);
        if (m.find()) return Integer.parseInt(m.group(1));
        return 2026;
    }

    static String extractSeasonLabel(String title, int year) {
        String up = compactText(title).toUpperCase();
        String season = "Spring";
        if (up.contains("SUMMER")) season = "Summer";
        else if (up.contains("FALL"))   season = "Fall";
        else if (up.contains("WINTER")) season = "Winter";
        return season + " " + year;
    }

    static String[] extractPoolInfo(String poolId, String fullText) {
        String[] fallback = knownPoolInfo(poolId);
        String name = fallback[0];
        Matcher m = Pattern.compile(
            Pattern.quote(name) + "\\s*\\(([^)]+)\\):\\s*(510-\\d{3}-\\d{4})",
            Pattern.CASE_INSENSITIVE
        ).matcher(fullText);
        if (m.find()) {
            String address = m.group(1).trim();
            String phone = m.group(2).trim();
            if (address.contains(",") && address.toLowerCase().contains("berkeley")) {
                return new String[]{name, address, phone};
            }
            return new String[]{name, fallback[1], phone};
        }
        return fallback;
    }

    private static String[] knownPoolInfo(String poolId) {
        if (poolId.equals("king"))
            return new String[]{"King Pool", "1700 Hopkins St., Berkeley, CA 94707", "510-981-5105"};
        return new String[]{"West Campus Pool", "2100 Browning St., Berkeley, CA 94707", "510-981-5125"};
    }

    static String extractLastRevised(String fullText, int year) {
        Matcher m = Pattern.compile(
            "Last Revised\\s+(\\d{1,2})/(\\d{1,2})/(\\d{2,4})",
            Pattern.CASE_INSENSITIVE
        ).matcher(fullText);
        if (m.find()) {
            int mo  = Integer.parseInt(m.group(1));
            int day = Integer.parseInt(m.group(2));
            int yr  = Integer.parseInt(m.group(3));
            if (yr < 100) yr += 2000;
            return String.format("%d-%02d-%02dT00:00:00Z", yr, mo, day);
        }
        return year + "-01-01T00:00:00Z";
    }

    static List<Map<String, String>> extractClosures(String fullText, int year) {
        return extractClosuresFromText(fullText, year);
    }

    static List<Map<String, String>> extractClosures(
            String fullText, List<List<TextChunk>> rows, int year) {
        LinkedHashMap<String, Map<String, String>> byDate = new LinkedHashMap<>();
        for (Map<String, String> c : extractClosuresFromText(fullText, year)) {
            byDate.put(c.get("date") + "|" + c.get("reason"), c);
        }
        for (Map<String, String> c : extractClosuresFromText(rowsText(rows), year)) {
            byDate.put(c.get("date") + "|" + c.get("reason"), c);
        }
        return new ArrayList<>(byDate.values());
    }

    private static List<Map<String, String>> extractClosuresFromText(String text, int year) {
        List<Map<String, String>> closures = new ArrayList<>();
        if (text == null || text.isBlank()) return closures;

        String compact = compactText(text).toLowerCase();
        int notesIdx = compact.indexOf("importantnotes");
        if (notesIdx < 0) return closures;
        String notes = compact.substring(notesIdx);

        int holidayIdx = notes.indexOf("holiday");
        if (holidayIdx >= 0) {
            int endIdx = firstPositive(
                notes.indexOf("closedfrom", holidayIdx),
                notes.indexOf("presummer", holidayIdx),
                notes.indexOf("stafftraining", holidayIdx)
            );
            String holidayText = endIdx >= 0 ? notes.substring(holidayIdx, endIdx) : notes.substring(holidayIdx);
            Matcher dm = compactMonthDayPattern().matcher(holidayText);
            while (dm.find()) {
                String date = parseCompactMonthDay(dm.group(1), dm.group(2), year);
                if (date != null) closures.add(closure(date, "City holiday"));
            }
        }

        Matcher rm = Pattern.compile(
            "closedfrom(" + monthAlternationLower() + ")(\\d{1,2})[-–—]?(\\d{1,2})for"
        ).matcher(notes);
        while (rm.find()) {
            Integer month = MONTH_MAP.get(rm.group(1));
            if (month != null) {
                int dayStart = Integer.parseInt(rm.group(2));
                int dayEnd = Integer.parseInt(rm.group(3));
                for (int d = dayStart; d <= dayEnd; d++) {
                    closures.add(closure(String.format("%d-%02d-%02d", year, month, d),
                        "Pre-Summer Staff Training"));
                }
            }
        }

        if (closures.stream().noneMatch(c -> c.get("reason").contains("Pre-Summer"))
                && notes.contains("presummer") && notes.contains("stafftraining")
                && notes.contains("june6") && notes.contains("june7")) {
            closures.add(closure(String.format("%d-06-06", year), "Pre-Summer Staff Training"));
            closures.add(closure(String.format("%d-06-07", year), "Pre-Summer Staff Training"));
        }
        return closures;
    }

    private static Pattern compactMonthDayPattern() {
        return Pattern.compile("(" + monthAlternationLower() + ")(\\d{1,2})");
    }

    private static String monthAlternationLower() {
        return "january|february|march|april|may|june|july|august|september|october|november|december";
    }

    private static String parseCompactMonthDay(String monthName, String day, int year) {
        Integer month = MONTH_MAP.get(monthName.toLowerCase());
        if (month == null) return null;
        return String.format("%d-%02d-%02d", year, month, Integer.parseInt(day));
    }

    private static int firstPositive(int... indexes) {
        int first = -1;
        for (int index : indexes) {
            if (index >= 0 && (first < 0 || index < first)) first = index;
        }
        return first;
    }

    private static Map<String, String> closure(String date, String reason) {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("date",   date);
        m.put("reason", reason);
        return m;
    }

    // ── CLI entry point ────────────────────────────────────────────────────────

    public static void main(String[] args) {
        String poolId  = "king";
        String pdfPath = null;
        String outPath = null;

        for (int i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "--pool" -> poolId  = args[++i];
                case "--pdf"  -> pdfPath = args[++i];
                case "--out"  -> outPath = args[++i];
            }
        }

        if (pdfPath == null || outPath == null) {
            System.err.println("Usage: --pool <id> --pdf <path.pdf> --out <path.json>");
            System.exit(1);
        }

        try {
            ObjectNode result = parsePool(poolId, new File(pdfPath));
            File outFile = new File(outPath);
            if (outFile.getParentFile() != null) outFile.getParentFile().mkdirs();
            new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(outFile, result);
            System.out.println("Wrote " + outFile.getAbsolutePath());
        } catch (Exception e) {
            System.err.println("Parse failed: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
