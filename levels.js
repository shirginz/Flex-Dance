"use strict";

window.FlexDanceData = (() => {
  const properties = [
    { key: "flexDirection", css: "flex-direction", label: "כיוון", values: ["row", "row-reverse", "column", "column-reverse"] },
    { key: "justifyContent", css: "justify-content", label: "ציר ראשי", values: ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"] },
    { key: "alignItems", css: "align-items", label: "ציר משני", values: ["flex-start", "center", "flex-end"] },
    { key: "flexWrap", css: "flex-wrap", label: "גלישה", values: ["nowrap", "wrap", "wrap-reverse"] },
    { key: "alignContent", css: "align-content", label: "פיזור שורות", values: ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly", "stretch"] }
  ];
  const defaults = { flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", flexWrap: "nowrap", alignContent: "flex-start" };
  const levels = [
    {
      title: "01 / חזרת הפתיחה", topic: "JUSTIFY-CONTENT", count: 3,
      instruction: "סדרי את הרקדניות 1–3 בשורה משמאל לימין, במרכז הרוחב ובחלק העליון של הבמה. שמרי על המרווח הקבוע ביניהן.",
      target: { justifyContent: "center" },
      hint: "ב־row הציר הראשי אופקי. justify-content: center מרכז את הקבוצה לאורך השורה.",
      lesson: "justify-content מרכז את הקבוצה בציר הראשי בלי לשנות את סדר הפריטים."
    },
    {
      title: "02 / שורת קדמת הבמה", topic: "שני צירים", count: 3,
      instruction: "מקמי את הרקדניות 1–3 בשורה בחלק התחתון של הבמה, משמאל לימין. הראשונה בקצה השמאלי, האחרונה בקצה הימני, והרווחים ביניהן שווים.",
      target: { justifyContent: "space-between", alignItems: "flex-end" },
      hint: "שלבי space-between בציר הראשי עם flex-end בציר המשני. ב־row הציר המשני יורד מלמעלה למטה.",
      lesson: "justify-content מפזר לרוחב; align-items מצמיד לתחתית."
    },
    {
      title: "03 / טור במרכז הבמה", topic: "FLEX-DIRECTION", count: 3,
      instruction: "סדרי את הרקדניות 1–3 בעמודה מלמעלה למטה. מרכזי את העמודה גם לרוחב וגם לגובה, עם מרווח קבוע בין הרקדניות.",
      target: { flexDirection: "column", justifyContent: "center", alignItems: "center" },
      hint: "לאחר בחירת column, justify-content פועל לגובה ו־align-items לרוחב. כדי למרכז בשניהם נדרש center בשני המאפיינים.",
      lesson: "החלפת הכיוון לעמודה מחליפה את התפקידים הפיזיים של שני צירי היישור."
    },
    {
      title: "04 / כניסה מצד ימין", topic: "עמודה + פיזור", count: 4,
      instruction: "סדרי את הרקדניות 1–4 בעמודה צמודה לימין. רקדנית 1 למעלה ורקדנית 4 למטה, עם רווחים שווים בין כל הרקדניות.",
      target: { flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" },
      hint: "ב־column, space-between מפזר לגובה. בלוח LTR, flex-end של הציר המשני הוא הצד הימני.",
      lesson: "בעמודה, align-items: flex-end מצמיד לימין ולא לתחתית."
    },
    {
      title: "05 / תמונת מראה", topic: "ROW-REVERSE", count: 3,
      instruction: "סדרי שורה בחלק התחתון של הבמה ומרכזי אותה לרוחב. הסדר משמאל לימין צריך להיות 3, 2, 1, עם מרווח קבוע בין הרקדניות.",
      target: { flexDirection: "row-reverse", justifyContent: "center", alignItems: "flex-end" },
      hint: "row-reverse הופך את הכיוון החזותי בלי לשנות את סדר הרקדניות בקוד. הוסיפי מרכוז אופקי ויישור לתחתית.",
      lesson: "row-reverse הופך את כיוון הציר הראשי; המספרים מאפשרים לבדוק גם את הסדר."
    },
    {
      title: "06 / הטור מתהפך", topic: "COLUMN-REVERSE", count: 3,
      instruction: "סדרי עמודה במרכז הרוחב: רקדנית 3 למעלה, 2 באמצע ו־1 למטה. פזרי לגובה כך שכל מרווח פנימי יהיה כפול מהמרווח בקצוות, לאחר הפחתת ה־gap הקבוע מהמרווח הפנימי.",
      target: { flexDirection: "column-reverse", justifyContent: "space-around", alignItems: "center" },
      hint: "השתמשי ב־column-reverse וב־space-around. הערך space-around מחלק את השטח הפנוי סביב כל פריט; gap של 12px מתווסף בין הפריטים בלבד.",
      lesson: "space-around מחלק שטח פנוי סביב פריטים. gap מתווסף בנפרד, ולכן הרווח הפנימי הכולל אינו בדיוק כפול מהרווח בקצה."
    },
    {
      title: "07 / כל הלהקה על הבמה", topic: "FLEX-WRAP", count: 8,
      instruction: "סדרי 8 רקדניות בשתי שורות: 1–4 בשורה העליונה ו־5–8 מתחתיה, בכל שורה משמאל לימין. מרכזי את כל המבנה על הבמה עם מרווח קבוע בין השורות ובין הרקדניות.",
      target: { flexWrap: "wrap", justifyContent: "center", alignContent: "center" },
      hint: "בלי wrap הרקדניות גולשות החוצה. justify-content מרכז כל שורה; align-content: center מרכז את שתי השורות יחד לגובה.",
      lesson: "flex-wrap מאפשר שתי שורות. align-content מיישר את קבוצת השורות, ולא פריט בודד."
    },
    {
      title: "08 / שתי שורות להופעה", topic: "WRAP + SPACE-BETWEEN", count: 6,
      instruction: "מקמי את הרקדניות 1–4 בשורה העליונה ואת 5–6 בשורה התחתונה, משמאל לימין. בכל שורה הרקדנית הראשונה והאחרונה בקצוות, ושאר המרווחים שווים. השורות צמודות לחלק העליון והתחתון.",
      target: { flexWrap: "wrap", justifyContent: "space-between", alignContent: "space-between" },
      hint: "wrap יוצר שתי שורות, space-between ב־justify-content מפזר את הפריטים בכל שורה, ואותו ערך ב־align-content מרחיק את השורות זו מזו.",
      lesson: "הפיזור מחושב לכל שורת Flex בנפרד; בשורה האחרונה יש רק שתי רקדניות."
    },
    {
      title: "09 / שני טורים", topic: "COLUMN + WRAP", count: 6,
      instruction: "צרי שתי עמודות: רקדניות 1–4 בעמודה השמאלית ורקדניות 5–6 בימנית, בכל עמודה מלמעלה למטה. העמודות בקצוות, ובכל אחת הרקדניות מפוזרות בין החלק העליון לתחתון.",
      target: { flexDirection: "column", flexWrap: "wrap", justifyContent: "space-between", alignContent: "space-between" },
      hint: "ב־column עם wrap, רקדניות עוברות לעמודה הבאה כשנגמר הגובה. justify-content מפזר לגובה, ו־align-content מפזר את העמודות לרוחב.",
      lesson: "גלישה אינה חייבת ליצור שורות אופקיות. בכיוון column היא יוצרת עמודות."
    },
    {
      title: "10 / ריקוד הסיום", topic: "משימה משולבת", count: 8,
      instruction: "צרי שתי שורות בקצוות העליון והתחתון. הסדר משמאל לימין: 4, 3, 2, 1 למעלה; 8, 7, 6, 5 למטה. פזרי בכל שורה שטח פנוי שווה סביב כל רקדנית באמצעות space-around.",
      target: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "space-around", alignContent: "space-between" },
      hint: "שלבי row-reverse, גלישת wrap, פיזור space-around בכל שורה ו־space-between בין השורות. align-items פועל בתוך השורה ולא מפזר את השורות.",
      lesson: "שילוב הכיוון, הגלישה ופיזור השורות מאפשר לבנות סידור מורכב באמצעות Flexbox בלבד."
    }
  ].map((level, index) => Object.freeze({ ...level, id: index + 1, target: Object.freeze({ ...defaults, ...level.target }) }));
  return Object.freeze({ properties, defaults: Object.freeze(defaults), levels: Object.freeze(levels) });
})();
