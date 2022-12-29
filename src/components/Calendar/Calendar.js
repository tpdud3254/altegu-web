import moment from "moment";
import { useState } from "react";
import { Calendar as ReactCalendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendarStyle.css";
function Calendar() {
    const [date, setDate] = useState(new Date());

    return (
        <ReactCalendar
            calendarType="US"
            onChange={setDate}
            value={date}
            defaultView="month"
            showNeighboringMonth={false}
            formatDay={(locale, date) => moment(date).format("DD")}
            tileContent={({ date, view }) => {
                let html = [];
                // 현재 날짜가 post 작성한 날짜 배열(mark)에 있다면, dot div 추가
                if (moment(date).format("YYYY-MM-DD") === "2022-11-29") {
                    html.push(<div className="content">text</div>); //TODOS: 필요하면 나중에 추가
                }
                // 다른 조건을 주어서 html.push 에 추가적인 html 태그를 적용할 수 있음.
                return (
                    <div key={date} className="contents">
                        {html}
                    </div>
                );
            }}
        />
    );
}

export default Calendar;
