(function (blocks, editor, components, i18n, element) {
  var el = wp.element.createElement
  var registerBlockType = wp.blocks.registerBlockType
  var RichText = wp.editor.RichText
  var BlockControls = wp.editor.BlockControls
  var InspectorControls = wp.editor.InspectorControls
  var TextControl = components.TextControl
  var SelectControl = components.SelectControl

  var getNextSunday = function(y, m, d) {
    var date = new Date(y, m - 1, d || 1);
    var weekday = date.getDay();
    if (weekday === 0) return date.getDate();
    return 7 - weekday + date.getDate();
  }
  var getAllSundaysInMonth = function(y, m) {
    var date = new Date(y, m - 1, getNextSunday(y, m));
    var sundays = [date.getDate()];
    while(date.getMonth() === m) {
      date.setDate(date.getDate() + 7);
      if (date.getMonth() === m) {
        sundays.push(date.getDate());
      }
    }
    return sundays;
  }
  var getLastSundayInMonth = function(y, m) {
    var sunday = getNextSunday(y, m);
    var date = new Date(y, m - 1, sunday);
    while(date.getMonth() === m) {
      date.setDate(date.getDate() + 7);
      if (date.getMonth() === m) {
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
      {label: 'January', value: '01'},
      {label: 'February', value: '02'},
      {label: 'March', value: '03'},
      {label: 'April', value: '04'},
      {label: 'May', value: '05'},
      {label: 'June', value: '06'}
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
    var y = dateparts[0];
    var m = dateparts[1];
    var d = dateparts[2];
    return (
      el('div', null, 
        el(SelectControl, {
          value: y,
          options: getYearOptions(),
          onChange: function(newY) {
            onChange(newY, m, getNextSunday(newY, parseInt(m, 10)));
          }
        }),
        el(SelectControl, {
          value: m,
          options: getMonthOptions(),
          onChange: function(newM) {
            onChange(y, newM, getNextSunday(y, parseInt(newM, 10)));
          }
        }),
        el(SelectControl, {
          value: d,
          options: getDateOptions(y, parseInt(m, 10)),
          onChange: function(newD) {
            onChange(y, m, newD);
          }
        })
      )
    );
  };

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
          el('div', null, 
            el('label', null, 'First Sunday of School Year'),
            el(SundayPicker, {
              value: attributes.firstSunday || getDefaultFirstSunday(),
              onChange: function(val) {
                console.log(val);
                //props.setAttribute({firstSunday: val})
              }
            })
          ),
          el('div', null,
            el('label', null, 'Last Sunday of School Year'),
            el(SundayPicker, {
              value: attributes.lastSunday || getDefaultLastSunday(),
              onChange: function(val) {
                console.log(val);
                //props.setAttribute({lastSunday: val})
              }
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