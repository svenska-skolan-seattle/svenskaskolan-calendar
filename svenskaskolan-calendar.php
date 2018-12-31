<?php
/*
Plugin Name:  SvenskaSkolan-Calendar
Description:  Render svenska skolan's class calendar
Version:      20181231
Author:       Andreas McDermott
*/
  defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

  function ssc_register_custom_post_type() {
    register_post_type('svenskaskolan-calendar',
      array(
        'labels' => array(
          'name'          => __('Calendars'),
          'singular_name' => __('Calendar'),
        ),
        'public'      => true,
        'has_archive' => true,
      )
    );
  }

  function ssc_init() {
    ssc_register_custom_post_type();
  }

  add_action('init', 'ssc_init');
?>