(function (blocks, editor, components, i18n, element) {
  var el = wp.element.createElement
  var registerBlockType = wp.blocks.registerBlockType
  var RichText = wp.editor.RichText
  var BlockControls = wp.editor.BlockControls
  var InspectorControls = wp.editor.InspectorControls
  var TextControl = components.TextControl

  var getNextSunday = function(y, m, d) {
    var date = new Date(y, m, d || 1);
    var weekday = date.getDay();
    if (weekday === 0) return date.getDate();
    return 7 - weekday + date.getDate();
  }
  var getLastSundayInMonth = function(y, m) {
    var sunday = getNextSunday(y, m);
    var date = new Date(y, m, sunday);
    while(date.getMonth() === m) {
      date.setDate(date.getDate() + 7);
      if (date.getMonth() === m) {
        sunday = date.getDate();
      }
    }
    return sunday;
  }
  var formatDate = function(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + '-' + (m < 10 ? '0' : '') + m + (d < 10 ? '0' : '') + d;
  }
  var getDefaultFirstSunday = function() {
    var currentYear = new Date().getFullYear()
    return formatDate(new Date(currentYear, 7, getNextSunday(currentYear, 7)));
  }
  var getDefaultLastSunday = function() {
    var nextYear = new Date().getFullYear() + 1
    return formatDate(new Date(nextYear, 5, getLastSundayInMonth(nextYear, 5)));
  }

  var SundayPicker = function(props) {
    var value = props.value;
    // var date = new Date(value);
    return el('div', null, value);
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
                props.setAttribute({firstSunday: val})
              }
            })
          ),
          el('div', null,
            el('label', null, 'Last Sunday of School Year'),
            el(SundayPicker, {
              value: attributes.lastSunday || getDefaultLastSunday(),
              onChange: function(val) {
                props.setAttribute({lastSunday: val})
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