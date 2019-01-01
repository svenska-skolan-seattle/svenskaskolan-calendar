<?php
/*
Plugin Name:  SvenskaSkolan-Calendar
Description:  Render svenska skolan's class calendar
Version:      20190101
Author:       Andreas McDermott
*/
  defined( 'ABSPATH' ) or exit;

  function format_date($date) {
    $year = $date['year'];
    $month = str_pad(strval($date['mon']), 2, "0", STR_PAD_LEFT);
    $day = str_pad(strval($date['mday']), 2, "0", STR_PAD_LEFT);
    return "{$year}-{$month}-{$day}";
  }

  function today_is_sunday() {
    $date = getdate();
    $weekday = $date['wday'];
    return $weekday == 0;
  }

  function ssc_render_subtitle($attributes, $content) {
    $firstSunday = $attributes['firstSunday'];
    $lastSunday = $attributes['lastSunday'];

    $fallYear = explode("-", $firstSunday)[0];
    $springYear = explode("-", $lastSunday)[0];

    return "<h3>L&auml;s&aring;ret {$fallYear}-{$springYear}</h3>";
  }

  function ssc_render_this_sunday($attributes, $content) {
    $nextSunday = today_is_sunday() 
      ? format_date(getdate())
      : format_date(getdate(strtotime('next sunday')));
    $schedule = $attributes['schedule'];

    $item = null;
    foreach($schedule as $struct) {
      if ($nextSunday == $struct['date']) {
          $item = $struct;
          break;
      }
    }

    if ($item == null) return "";

    $date = $item['date'];
    $isSchoolDay = $item['isSchoolDay'];
    $time = $item['time'];
    $notes = $item['notes'];
    if (!$isSchoolDay) {
      $notes = "Ingen skola" . (isset($notes) ? " - " . $notes : "");
      unset($time);
    }

    return "<div class='ssc-this-sunday-container'>" .
      "<strong class='ssc-this-sunday-title'>Nu p&aring; s&ouml;ndag ({$date}):</strong>" .
      (isset($time) ? "<p class='ssc-this-sunday-time'>{$time}</p>" : "") .
      (isset($notes) ? "<p class='ssc-this-sunday-notes'>{$notes}</p>" : "") .
    "</div>";
  }

  function ssc_render_calendar($attributes, $content) {
    return "<div class='ssc-calendar-container'>TODO</div>";
  }

  function ssc_render_block($attributes, $content) {
    $subtitle = ssc_render_subtitle($attributes, $content);
    $thisSunday = ssc_render_this_sunday($attributes, $content);
    $calendar = ssc_render_calendar($attributes, $content);

    return "<div>{$subtitle}{$thisSunday}{$calendar}</div>";
  }

  function ssc_init() {
    if (!function_exists('register_block_type')) return;

    wp_register_script(
      'ssc-script',
      plugins_url( 'block.js', __FILE__ ),
      array('wp-blocks', 'wp-components', 'wp-element', 'wp-i18n', 'wp-editor'),
      filemtime( plugin_dir_path( __FILE__ ) . 'block.js' ),
      true
    );
    
    wp_register_style(
      'ssc-editor-style',
      plugins_url('editor.css', __FILE__ ),
      array( 'wp-edit-blocks' ),
      filemtime( plugin_dir_path( __FILE__ ) . 'editor.css' )
    );
    wp_register_style(
      'ssc-frontend-style',
      plugins_url( 'style.css', __FILE__ ),
      array(),
      filemtime( plugin_dir_path( __FILE__ ) . 'style.css' )
    );

    register_block_type('svenskaskolan/calendar', 
      array(
        'editor_script'   => 'ssc-script',
        'editor_style'    => 'ssc-editor-style',
        'style'           => 'ssc-frontend-style',
        'attributes'      => array(
          'firstSunday' => array(
            'type' => 'string'
          ),
          'lastSunday' => array(
            'type' => 'string'
          ),
          'schedule' => array(
            'type' => 'array'
          )
        ),
        'render_callback' => 'ssc_render_block',
      )
    );
  }

  add_action('init', 'ssc_init');
?>