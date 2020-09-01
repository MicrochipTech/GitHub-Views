import React, { useState, useContext, useRef } from "react";
import { DatePicker } from "material-ui-pickers";
import { MuiPickersContext } from "material-ui-pickers";
import withStyles from "@material-ui/core/styles/withStyles";
import { styles as dayStyles } from "material-ui-pickers/DatePicker/components/Day";
import clsx from "clsx";

function DateRangePicker({
  classes,
  value,
  onChange,
  labelFunc,
  format,
  emptyLabel,
  autoOk,
  onClose,
  ...props
}) {
  const [begin, setBegin] = useState(0);
  const [end, setEnd] = useState(0);
  const [hover, setHover] = useState(undefined);
  const picker = useRef();
  const utils = useContext(MuiPickersContext);

  const min = Math.min(begin, end || hover);
  const max = Math.max(begin, end || hover);

  function renderDay(day, selectedDate, dayInCurrentMonth, dayComponent) {
    return React.cloneElement(dayComponent, {
      onClick: e => {
        e.stopPropagation();
        if (!begin) setBegin(day);
        else if (!end) {
          setEnd(day);
          if (autoOk) {
            onChange([begin, day].sort());
            picker.current.close();
          }
        } else {
          setBegin(day);
          setEnd(undefined);
        }
      },
      onMouseEnter: e => setHover(day),
      className: clsx(classes.day, {
        [classes.hidden]: dayComponent.props.hidden,
        [classes.current]: dayComponent.props.current,
        [classes.isDisabled]: dayComponent.props.disabled,
        [classes.isSelected]: day >= min && day <= max,
        [classes.beginCap]: utils.isSameDay(day, min),
        [classes.endCap]: utils.isSameDay(day, max)
      })
    });
  }

  const formatDate = date => utils.format(date, format || utils.dateFormat);

  return (
    <DatePicker
      {...props}
      value={begin}
      renderDay={renderDay}
      onClose={() => {
        onChange([begin, end].sort());
        if (onClose) onClose();
      }}
      onChange={() => {}}
      onClear={() => {
        setBegin(undefined);
        setEnd(undefined);
        setHover(undefined);
        onChange([]);
      }}
      ref={picker}
      labelFunc={(date, invalid) =>
        labelFunc
          ? labelFunc([begin, end].sort(), invalid)
          : date && begin && end
          ? `${formatDate(begin)} - ${formatDate(end)}`
          : emptyLabel || ""
      }
    />
  );
}

export const styles = theme => {
  const base = dayStyles(theme);
  return {
    ...base,
    day: {
      ...base.day,
      margin: 0,
      width: "40px",
      borderRadius: "0"
    },
    beginCap: {
      borderRadius: "50% 0 0 50%"
    },
    endCap: {
      borderRadius: "0 50% 50% 0"
    }
  };
};

export default withStyles(styles, { name: "DateRangePicker" })(DateRangePicker);
