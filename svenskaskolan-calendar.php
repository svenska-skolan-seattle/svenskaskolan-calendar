<?php
/*
Plugin Name:  SvenskaSkolan-Calendar
Description:  Render svenska skolan's class calendar
Version:      20181231
Author:       Andreas McDermott
*/
  defined( 'ABSPATH' ) or exit;

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

    register_block_type( 'svenskaskolan/calendar', array(
      'editor_script' => 'ssc-script',
      'editor_style'  => 'ssc-editor-style',
      'style'         => 'ssc-frontend-style',
    ) );
  }

  add_action('init', 'ssc_init');
?>