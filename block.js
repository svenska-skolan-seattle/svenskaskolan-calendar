(function (blocks, editor, components, i18n, element, compose) {
  var el = wp.element.createElement
  var registerBlockType = wp.blocks.registerBlockType
  var RichText = wp.editor.RichText
  var BlockControls = wp.editor.BlockControls
  var InspectorControls = wp.editor.InspectorControls
  var TextControl = components.TextControl
  var withState = compose.withState;

  var getNextSunday = function(y, m, d) {
    var date = new Date(y, m, d || 1);
    var weekday = date.getDay();
    if (weekday === 0) return date.getDate();
    return 7 - weekday + date.getDate();
  }
  var currentYear = new Date().getFullYear();
  var SundayPicker = withState({
    year: currentYear,
    month: 7,
    date: getNextSunday(currentYear, 7)
  })(function(props) {
    var year = props.year;
    var month = props.month;
    var date = props.date;
    return el('div', null, year + '-' + (month + 1) + '-' + date);
  });

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
              value: attributes.firstSunday,
              onChange: function(val) {
                props.setAttribute({firstSunday: val})
              }
            })
          ),
          el('div', null,
            el('label', null, 'Last Sunday of School Year'),
            el(SundayPicker, {
              value: attributes.lastSunday,
              onChange: function(val) {
                props.setAttribute({lastSunday})
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