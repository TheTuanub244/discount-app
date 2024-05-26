import React from "react";
import {DatePicker} from "@nextui-org/react";
import {now, getLocalTimeZone} from "@internationalized/date";
import {useDateFormatter} from "@react-aria/i18n";
export default function Calendar({date, dispatch, type}) {
  return (
    <div className="w-full max-w-xl flex flex-row gap-4 mt-2">
      <DatePicker
        label={type == "startDate" ? "Start date" : "End date"}
        variant="bordered"
        hideTimeZone
        showMonthAndYearPickers
        defaultValue={now(getLocalTimeZone())}
        value={date}
        onChange={(value) => dispatch({type: type, payload: value})}
      />
    </div>
  );
}