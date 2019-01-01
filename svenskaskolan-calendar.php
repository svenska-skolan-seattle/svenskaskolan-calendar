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

  $months_names = array(
    "01" => "Januari",
    "02" => "Februari",
    "03" => "Mars",
    "04" => "April",
    "05" => "Maj",
    "06" => "Juni",
    "07" => "Juli",
    "08" => "Augusti",
    "09" => "September",
    "10" => "Oktober",
    "11" => "November",
    "12" => "December"
  );

  function ssc_render_semester($year, $schedule) {
    $curr_month = '';
    $content = '';
    foreach($schedule as $item) {
      $date_parts = explode("-", $item["date"]);
      $time = $item["time"];
      $notes = $item["notes"];
      $isSchoolDay = $item["isSchoolDay"];
      if (!$isSchoolDay) {
        unset($time);
        $notes = "Ingen skola" . (isset($notes) ? " - " . $notes : "");
      }
      $month = $date_parts[1];
      $day = $date_parts[2];

      if ($month != $curr_month) {
        $curr_month = $months;
        if ($content != "") {
          $content .= '</div>';
        }
        $month_name = $month_names[$month];
        $content .= "<div class='ssc-calendar-month'>" .
          "<strong class='ssc-month-title'>{$month_name}</strong>";
      }

      $content .= "<div class='ssc-calendar-week'>" .
        "<span class='ssc-calendar-day'>{$day}</span>" .
        (isset($time) ? "<span class='ssc-calendar-time'>{$time}</span>" : "") .
        (isset($notes) ? "<span class='ssc-calendar-notes'>{$notes}</span>" : "") .
      "</div>";
    }

    if ($content != "") {
      $content .= "</div>";
    }

    return "<div class='ssc-calendar-semester'>" .
        "<strong class='ssc-semester-title'>{$year}</strong>" . 
        $content .
      "</div>";
  }

  function ssc_render_calendar($attributes, $content) {
    $firstSunday = $attributes['firstSunday'];
    $lastSunday = $attributes['lastSunday'];
    $fallYear = explode("-", $firstSunday)[0];
    $springYear = explode("-", $lastSunday)[0];

    $schedule = $attributes['schedule'];

    $fall_schedule = array_filter($schedule, function($item) {
      return strpos($item['date'], $fallYear) == 0;
    });
    $spring_schedule = array_filter($schedule, function($item) {
      return strpos($item['date'], $springYear) == 0;
    });

    $fall = ssc_render_semester($fallYear, $fall_schedule);
    $spring = ssc_render_semester($springYear, $spring_schedule);

    return "<div class='ssc-calendar-container'>{$fall}{$spring}</div>";
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