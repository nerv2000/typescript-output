export namespace DateStr {
  const weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
  const weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function zf(value: string, len: number): string {
    let retString: string = value;

    if(len > retString.length) {
      while(len > retString.length) {
        retString = '0' + retString;
      }
    }

    return retString;
  }

  function calcHours(d: Date) : number {
    let h = d.getHours() % 12;
    if(0 == h) {
      h = 12;
    }
    return h;
  }

  function calcUTCHours(d: Date) : number {
    let h = d.getUTCHours() % 12;
    if(0 == h) {
      h = 12;
    }
    return h;
  }

  export function format(d: Date, f: string) : string {
    if (!d.valueOf()) {
      return " ";
    }

    return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|ms|KAP|EAP)/gi, $1 => {
      switch ($1) {
        case "yyyy": return String(d.getFullYear()); // 년 (4자리)
        case "yy": return zf(String(d.getFullYear() % 1000), 2); // 년 (2자리)
        case "MM": return zf(String(d.getMonth() + 1), 2); // 월 (2자리)
        case "dd": return zf(String(d.getDate()), 2); // 일 (2자리)
        case "KS": return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)
        case "KL": return weekKorName[d.getDay()]; // 요일 (긴 한글)
        case "ES": return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)
        case "EL": return weekEngName[d.getDay()]; // 요일 (긴 영어)
        case "HH": return zf(String(d.getHours()), 2); // 시간 (24시간 기준, 2자리)
        case "hh": return zf(String(calcHours(d)), 2); // 시간 (12시간 기준, 2자리)
        case "mm": return zf(String(d.getMinutes()), 2); // 분 (2자리)
        case "ss": return zf(String(d.getSeconds()), 2); // 초 (2자리)
        case "ms": return zf(String(d.getMilliseconds()), 3); // 밀리세컨드(3자리)
        case "KAP": return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분 (한글)
        case "EAP": return d.getHours() < 12 ? "AM" : "PM"; // 오전/오후 구분 (영문)
        default: return $1;
      }
    });
  };

  export function formatUTC(d: Date, f: string): string {
    if (!d.valueOf()) {
      return " ";
    }

    return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|ms|KAP|EAP)/gi, $1 => {
      switch ($1) {
        case "yyyy": return String(d.getUTCFullYear()); // 년 (4자리)
        case "yy": return zf(String(d.getUTCFullYear() % 1000), 2); // 년 (2자리)
        case "MM": return zf(String(d.getUTCMonth() + 1), 2); // 월 (2자리)
        case "dd": return zf(String(d.getUTCDate()), 2); // 일 (2자리)
        case "KS": return weekKorShortName[d.getUTCDay()]; // 요일 (짧은 한글)
        case "KL": return weekKorName[d.getUTCDay()]; // 요일 (긴 한글)
        case "ES": return weekEngShortName[d.getUTCDay()]; // 요일 (짧은 영어)
        case "EL": return weekEngName[d.getUTCDay()]; // 요일 (긴 영어)
        case "HH": return zf(String(d.getUTCHours()), 2); // 시간 (24시간 기준, 2자리)
        case "hh": return zf(String(calcUTCHours(d)), 2); // 시간 (12시간 기준, 2자리)
        case "mm": return zf(String(d.getUTCMinutes()), 2); // 분 (2자리)
        case "ss": return zf(String(d.getUTCSeconds()), 2); // 초 (2자리)
        case "ms": return zf(String(d.getUTCMilliseconds()), 3); // 밀리세컨드(3자리)
        case "KAP": return d.getUTCHours() < 12 ? "오전" : "오후"; // 오전/오후 구분 (한글)
        case "EAP": return d.getUTCHours() < 12 ? "AM" : "PM"; // 오전/오후 구분 (영문)
        default: return $1;
      }
    });
  }
}

