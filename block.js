(function (blocks, editor, components, i18n, element) {
  var el = wp.element.createElement
  var registerBlockType = wp.blocks.registerBlockType
  var RichText = wp.editor.RichText
  var BlockControls = wp.editor.BlockControls
  var InspectorControls = wp.editor.InspectorControls
  var TextControl = components.TextControl
  var DatePicker = components.DatePicker

  registerBlockType('svenskaskolan/calendar', {
    title: i18n.__('Calendar'),
    description: i18n.__('A custom block for displaying school calendar.'),
    icon: 'calendar-alt',
    category: 'common',
    attributes: {
      firstWeek: {
        type: 'string'
      }
    },

    edit: function(props) {
      var attributes = props.attributes

      return el(
        'div', null, 
        el(DatePicker, {
          currentDate: attributes.firstWeek,
          onChange: function(date) {
            props.setAttribute({firstWeek: date.toISOString()})
          }
        })
      );
    },

    save: function(props) {
      return el('div', null, 'yohooooo');
    }
  });

})(
  window.wp.blocks,
  window.wp.editor,
  window.wp.components,
  window.wp.i18n,
  window.wp.element
);