(function (blocks, editor, components, i18n, element) {
  var el = wp.element.createElement
  var registerBlockType = wp.blocks.registerBlockType
  var RichText = wp.editor.RichText
  var BlockControls = wp.editor.BlockControls
  var InspectorControls = wp.editor.InspectorControls
  var TextControl = components.TextControl
  var SelectControl = components.SelectControl
  var Button = components.Button

  var getNextSunday = function(y, m, d) {
    var date = new Date(y, m - 1, d || 1);
    var weekday = date.getDay();
    if (weekday === 0) return date.getDate();
    return 7 - weekday + date.getDate();
  }
  var getAllSundaysInMonth = function(y, m) {
    var datemonth = m - 1;
    var date = new Date(y, datemonth, getNextSunday(y, m));
    var sundays = [date.getDate()];
    while(date.getMonth() === datemonth) {
      date.setDate(date.getDate() + 7);
      if (date.getMonth() === datemonth) {
        sundays.push(date.getDate());
      }
    }
    return sundays;
  }
  var getLastSundayInMonth = function(y, m) {
    var datemonth = m - 1;
    var sunday = getNextSunday(y, m);
    var date = new Date(y, datemonth, sunday);
    while(date.getMonth() === datemonth) {
      date.setDate(date.getDate() + 7);
      if (date.getMonth() === datemonth) {
        sunday = date.getDate();
      }
    }
    return sunday;
  }
  var formatYearMonthDate = function(y, m, d) {
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }
  var getDefaultFirstSunday = function() {
    var currentYear = new Date().getFullYear()
    return formatYearMonthDate(currentYear, 8, getNextSunday(currentYear, 8));
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
      {label: 'August', value: '8'},
      {label: 'September', value: '9'},
      {label: 'October', value: '10'},
      {label: 'November', value: '11'},
      {label: 'December', value: '12'},
      {label: 'January', value: '1'},
      {label: 'February', value: '2'},
      {label: 'March', value: '3'},
      {label: 'April', value: '4'},
      {label: 'May', value: '5'},
      {label: 'June', value: '6'}
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

  var SundayPicker = function(props) {
    var value = props.value;
    var onChange = function(_y, _m, _d) {
      props.onChange(formatYearMonthDate(_y, _m, _d));
    }
    var dateparts = value.split('-');
    var y = parseInt(dateparts[0], 10);
    var m = parseInt(dateparts[1], 10);
    var d = parseInt(dateparts[2], 10);
    return (
      el('div', null, 
        el(SelectControl, {
          value: String(y),
          options: getYearOptions(),
          onChange: function(newY) {
            onChange(newY, m, getNextSunday(newY, m));
          }
        }),
        el(SelectControl, {
          value: String(m),
          options: getMonthOptions(),
          onChange: function(newM) {
            onChange(y, newM, getNextSunday(y, newM));
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

  var generateSchedule = function(firstSunday, lastSunday) {
    if (!firstSunday || !lastSunday) return;
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
      }
    },

    edit: function(props) {
      var attributes = props.attributes

      return (
        el('div', null,
          el('div', {className: 'sunday-pickers-container'},
            el('div', {className: 'sunday-picker-container'}, 
              el('label', null, 'First Sunday of School Year'),
              el(SundayPicker, {
                value: attributes.firstSunday || getDefaultFirstSunday(),
                onChange: function(val) {
                  console.log(val);
                  //props.setAttribute({firstSunday: val})
                }
              })
            ),
            el('div', {className: 'sunday-picker-container'},
              el('label', null, 'Last Sunday of School Year'),
              el(SundayPicker, {
                value: attributes.lastSunday || getDefaultLastSunday(),
                onChange: function(val) {
                  console.log(val);
                  //props.setAttribute({lastSunday: val})
                }
              })
            ),
            el(Button, {
              onClick: generateSchedule(attributes.firstSunday, attributes.lastSunday)
            })
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