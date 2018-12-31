(function (blocks, editor, components, i18n, element) {
  var el = wp.element.createElement
  var registerBlockType = wp.blocks.registerBlockType
  var RichText = wp.editor.RichText
  var BlockControls = wp.editor.BlockControls
  var InspectorControls = wp.editor.InspectorControls
  var TextControl = components.TextControl
  var SelectControl = components.SelectControl
  var Button = components.Button
  var CheckboxControl = components.CheckboxControl

  var formatYearMonthDate = function(y, m, d) {
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }
  var formatDate = function(date) {
    return formatYearMonthDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }
  var getNextSunday = function(y, m, d) {
    var date = new Date(y, m - 1, d || 1);
    var weekday = date.getDay();
    if (weekday === 0) return date;
    date.setDate(7 - weekday + date.getDate());
    return date;
  }
  var getAllSundaysInMonth = function(y, m) {
    var datemonth = m - 1;
    var date = getNextSunday(y, m);
    var sundays = [date.getDate()];
    while(date.getMonth() === datemonth) {
      date.setDate(date.getDate() + 7);
      if (date.getMonth() === datemonth) {
        sundays.push(date.getDate());
      }
    }
    return sundays;
  }
  var getAllSundaysInRange = function(s, e) {
    var sundays = [];
    var date = s;
    while(date <= e) {
      sundays.push(formatDate(date));
      date.setDate(date.getDate() + 7);
    }
    return sundays;
  }
  var getLastSundayInMonth = function(y, m) {
    var datemonth = m - 1;
    var date = getNextSunday(y, m);
    var sunday = date.getDate();
    while(date.getMonth() === datemonth) {
      date.setDate(date.getDate() + 7);
      if (date.getMonth() === datemonth) {
        sunday = date.getDate();
      }
    }
    return sunday;
  }
  var getDefaultFirstSunday = function() {
    var currentYear = new Date().getFullYear()
    return formatDate(getNextSunday(currentYear, 8));
  }
  var getDefaultLastSunday = function() {
    var nextYear = new Date().getFullYear() + 1
    return formatYearMonthDate(nextYear, 6, getLastSundayInMonth(nextYear, 6));
  }
  var getYearOptions = function() {
    var currentYear = new Date().getFullYear();
    var years = [];
    for(var y = currentYear - 1; y < currentYear + 6; ++y) {
      years.push({label: String(y), value: String(y)});
    }
    return years;
  }
  var getMonthOptions = function() {
    return [
      {label: 'January', value: '1'},
      {label: 'February', value: '2'},
      {label: 'March', value: '3'},
      {label: 'April', value: '4'},
      {label: 'May', value: '5'},
      {label: 'June', value: '6'},
      {label: 'July', value: '7'},
      {label: 'August', value: '8'},
      {label: 'September', value: '9'},
      {label: 'October', value: '10'},
      {label: 'November', value: '11'},
      {label: 'December', value: '12'}
    ]
  }
  var getDateOptions = function(y, m) {
    var sundays = getAllSundaysInMonth(y, m);
    var options = [];
    for(var i = 0; i < sundays.length; ++i) {
      options.push({label: String(sundays[i]), value: String(sundays[i])});
    }
    return options;
  }
  var getDateParts = function(str) {
    return str.split('-').map(function(s) { return parseInt(s, 10); });
  }
  var strToDate = function(str) {
    var p = getDateParts(str);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  var SundayPicker = function(props) {
    var onChange = function(_y, _m, _d) { props.onChange(formatYearMonthDate(_y, _m, _d)); }
    var dateparts = getDateParts(props.value);
    var y = dateparts[0];
    var m = dateparts[1];
    var d = dateparts[2];
    return (
      el('div', {className: 'ssc-sunday-picker'}, 
        el(SelectControl, {
          value: String(y),
          options: getYearOptions(),
          onChange: function(newY) {
            var d = getNextSunday(newY, m);
            onChange(newY, m, d.getDate());
          }
        }),
        el(SelectControl, {
          value: String(m),
          options: getMonthOptions(),
          onChange: function(newM) {
            var d = getNextSunday(y, newM);
            onChange(y, newM, d.getDate());
          }
        }),
        el(SelectControl, {
          value: String(d),
          options: getDateOptions(y, m),
          onChange: function(newD) {
            onChange(y, m, newD);
          }
        })
      )
    );
  };

  var SundayEditor = function(props) {
    var value = props.value;
    var isSchoolDay = value.isSchoolDay;
    var date = value.date;
    var time = value.time;
    var notes = value.notes;
    return (
      el('li', {className: 'ssc-sunday-editor'},
        el('strong', null, date),
        el(CheckboxControl, {
          checked: !isSchoolDay,
          label: 'No School',
          onChange: function(val) {
            props.onChange(Object.assign(value, {isSchoolDay: !val}));
          }
        }),
        el(TextControl, {
          value: time,
          onChange: function(val) {
            props.onChange(Object.assign(value, {time: val}));
          }
        }),
        el(RichText, {
          value: notes,
          tagName: 'p',
          placeholder: 'Additional information...',
          keepPlaceholderOnFocus: true,
          onChange: function(val) {
            props.onChange(Object.assign(value, {notes: val}));
          }
        })
      )
    );
  }

  var getSundaySchedule = function(date) {
    return {
      date: date,
      time: '10 - 12:30',
      notes: '',
      isSchoolDay: true
    }
  }

  var createSchedule = function(firstSunday, lastSunday) {
    if (!firstSunday || !lastSunday) return [];
    var startDate = strToDate(firstSunday);
    var endDate = strToDate(lastSunday);
    var sundays = getAllSundaysInRange(startDate, endDate);
    return sundays.map(getSundaySchedule);
  }

  var updateSchedule = function(oldSchedule, firstSunday, lastSunday) {
    var newSchedule = createSchedule(firstSunday, lastSunday);
    var n = 0;
    var o = 0;

    while(n < newSchedule.length && o < oldSchedule.length) {
      if (newSchedule[n].date === oldSchedule[o].date) {
        newSchedule[n] = Object.assign(newSchedule[n], oldSchedule[o]);
        n++;
        o++;
      } else if (newSchedule[n].date < oldSchedule[o].date) {
        n++;
      } else if (newSchedule[n].date > oldSchedule[o].date) {
        o++;
      }
    }
    return newSchedule;
  }

  registerBlockType('svenskaskolan/calendar', {
    title: i18n.__('Calendar'),
    description: i18n.__('A custom block for displaying school calendar.'),
    icon: 'calendar-alt',
    category: 'common',
    attributes: {
      firstSunday: {
        type: 'string'
      },
      lastSunday: {
        type: 'string'
      },
      schedule: {
        type: 'array'
      }
    },

    edit: function(props) {
      var attributes = props.attributes

      return (
        el('div', null,
          el('div', {className: 'ssc-sunday-pickers-container'},
            el('div', {className: 'ssc-sunday-picker-container'}, 
              el('label', null, 'First Sunday of School Year'),
              el(SundayPicker, {
                value: attributes.firstSunday || getDefaultFirstSunday(),
                onChange: function(val) {
                  props.setAttributes({firstSunday: val})
                }
              })
            ),
            el('div', {className: 'ssc-sunday-picker-container'},
              el('label', null, 'Last Sunday of School Year'),
              el(SundayPicker, {
                value: attributes.lastSunday || getDefaultLastSunday(),
                onChange: function(val) {
                  props.setAttributes({lastSunday: val})
                }
              })
            ),
          ),
          
          el('div', {className: 'ssc-create-schedule-container'}, 
            el(Button, {
              isDefault: true,
              onClick: function() {
                var schedule = updateSchedule(
                  attributes.schedule || [],
                  attributes.firstSunday || getDefaultFirstSunday(), 
                  attributes.lastSunday || getDefaultLastSunday());
                props.setAttributes({schedule: schedule});
              }
            }, 'Update Schedule'),
          ),

          el('ul', {className: 'ssc-schedule'}, 
            (attributes.schedule || []).map(function(sunday) {
              return el(SundayEditor, {
                key: sunday.date,
                value: sunday,
                onChange: function(newSunday) {
                  var newSchedule = attributes.schedule.map(function(sunday) {
                    if (sunday.date === newSunday.date) return newSunday;
                    return sunday;
                  })
                  props.setAttributes({schedule: newSchedule});
                }
              })
            })
          ),

          el('div', {className: 'ssc-add-sunday-container'},
            el(Button, {
              isDefault: true,
              onClick: function() {
                var schedule = attributes.schedule;
                if (schedule.length > 0) {
                  var lastSunday = schedule[schedule.length - 1].date;
                  var date = getDateParts(lastSunday);
                  var nextSunday = getNextSunday(date[0], date[1], date[2]);
                  var newDate = formatDate(nextSunday);
                  schedule.push(getSundaySchedule(newDate));
                  props.setAttributes({schedule: schedule, lastSunday: newDate});
                }
              }
            }, 'Add Next Sunday')
          )
        )
      )
    },

    save: function(props) {
      var attributes = props.attributes
      return el('div', null, attributes.firstSunday + ' - ' + attributes.lastSunday);
    }
  });

})(
  window.wp.blocks,
  window.wp.editor,
  window.wp.components,
  window.wp.i18n,
  window.wp.element,
  window.wp.compose
);