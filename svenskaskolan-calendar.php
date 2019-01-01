<?php
/*
Plugin Name:  SvenskaSkolan-Calendar
Description:  Render svenska skolan's class calendar
Version:      20190101
Author:       Andreas McDermott
*/
  defined( 'ABSPATH' ) or exit;

  function ssc_render_block($attributes, $content) {
    $firstSunday = $attributes['firstSunday'];
    $lastSunday = $attributes['lastSunday'];
    $schedule = $attributes['schedule'];

    $fallYear = $firstSunday.explode("-")[0];
    $springYear = $lastSunday.explode("-")[0];

    $subtitle = "<h3>L&auml;s&aring;ret {$fallYear}-{$springYear}</h3>";
    $thisSunday = (
      "<div class='ssc-calendar-this-sunday-container'>" .
        "TODO" .
      "</div>"
    );
    $calendar = (
      "<div class='ssc-calendar-container'>" . 
        "TODO" .
      "</div>"
    );

    return (
      "<div>" .
        "{$subtitle}" .
        "{$thisSunday}" .
        "{$calendar}" .
      "</div>"
    );
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