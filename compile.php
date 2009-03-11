<?php

# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is Weave Basic Object Server
#
# The Initial Developer of the Original Code is
# Mozilla Labs.
# Portions created by the Initial Developer are Copyright (C) 2008
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#	Toby Elliott (telliott@mozilla.com)
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****
	
	require_once 'server/lib/personas_constants.php';	
	require_once 'server/lib/storage.php';

	$page_size = 21;
	
	$db = new PersonaStorage();
	$categories = $db->get_categories();


	function extract_record_data($item)
	{
		$padded_id = $item{'id'} < 10 ? '0' . $item{'id'} : $item{'id'};
		$extracted = array('id' => $item{'id'}, 
						'name' => $item{'name'},
						'accentcolor' => $item{'accentcolor'} ? '#' . $item{'accentcolor'} : null,
						'textcolor' => $item{'textcolor'} ? '#' . $item{'textcolor'} : null,
						'header' => url_prefix($item{'id'}) . $item{'header'}, 
						'footer' => url_prefix($item{'id'}) . $item{'footer'});
		return $extracted;	
	}
		
	function url_prefix($id)
	{
		$second_folder = $id%10;
		$first_folder = ($id%100 - $second_folder)/10;
		return  $first_folder . '/' . $second_folder .  '/'. $id . '/';
	}

	function make_persona_path($persona_id)
	{
		$second_folder = $persona_id%10;
		$first_folder = ($persona_id%100 - $second_folder)/10;

		$persona_path = PERSONAS_STORAGE_PREFIX . "/gallery/" . $first_folder;
		if (!is_dir($persona_path)) { mkdir($persona_path); }
		$persona_path .= "/" . $second_folder;
		if (!is_dir($persona_path)) { mkdir($persona_path); }
		return $persona_path;
	}
	
	function get_directory_html($path, $file)
	{
		if (!is_dir(PERSONAS_STORAGE_PREFIX . "/gallery/$path"))
		{
			mkdir(PERSONAS_STORAGE_PREFIX . "/gallery/$path");
		}

		$ch = curl_init();
		$fp = fopen(PERSONAS_STORAGE_PREFIX . "/gallery/$path/$file", "w");	
		curl_setopt($ch, CURLOPT_URL, "http://localhost/store/dynamic/$path/$file");
		curl_setopt($ch, CURLOPT_FILE, $fp);
		curl_exec($ch);
		fclose($fp);	
	}

	function get_persona_html($id)
	{
		$path = make_persona_path($id);

		$ch = curl_init();
		$fp = fopen("$path/$id", "w");	
		curl_setopt($ch, CURLOPT_URL, "http://localhost/store/dynamic/persona/$id");
		curl_setopt($ch, CURLOPT_FILE, $fp);
		curl_exec($ch);
		fclose($fp);	
	}

	
	#Top level popular page
	$popular_list = $db->get_popular_personas(null, 21);
	foreach ($popular_list as $item)
	{
		$data = extract_record_data($item);
		$data['recent'] = (time() - strtotime($item['approve']) < 604800) ? true : false;
		$popular_json[] = $data;
	}
	$master['popular'] = $popular_json;

	get_directory_html('All', 'Popular');
	
	#Top level recent page
	$recent_list = $db->get_recent_personas(null, 21);
	foreach ($recent_list as $item)
	{
		$data = extract_record_data($item);
		$data['recent'] = (time() - strtotime($item['approve']) < 604800) ? true : false;
		$recent_json[] = $data;
	}
	$master['recent'] = $recent_json;

	get_directory_html('All', 'Recent');
	

	foreach ($categories as $category)
	{
		#get category counts for pagination
		$category_total = $db->get_personas_by_category_count($category);
		$pages = floor($category_total/$page_size) + 1;
		
		$storage_path = PERSONAS_STORAGE_PREFIX . '/' . preg_replace('/ /', '_', $category);
		if (!is_dir($storage_path))
		{
			mkdir($storage_path);
		}

		$popular_list = $db->get_popular_personas($category, 10);
	
		$count = 0;
		$short_cat_list = array();
		foreach ($popular_list as $item)
		{
			$data = extract_record_data($item);
			$data['recent'] = (time() - strtotime($item['approve']) < 604800) ? true : false;
			$short_cat_list[] = $data;
		}
		$category_array[] = array('name' => $category, 'personas' => $short_cat_list);

		#get the html
		get_directory_html("$category", "Popular");
		get_directory_html("$category", "Recent");

		$i = 1;
		while ($i <= $pages)
		{
			get_directory_html("$category/All", "$i");
			$i++;
		}		
	}
	$master['categories'] = $category_array;

	file_put_contents(PERSONAS_STORAGE_PREFIX . '/index_1.json', json_encode($master));

	#now write out the individual pages
	$master_list = $db->get_active_persona_ids();
	foreach ($master_list as $persona)
	{
		get_active_persona_ids($id);
	}
	


?>