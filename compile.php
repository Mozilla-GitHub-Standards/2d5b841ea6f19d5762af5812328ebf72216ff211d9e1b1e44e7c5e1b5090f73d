<?php

# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# https://www.mozilla.org/MPL/
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
	require_once 'server/lib/personas_functions.php';	
	require_once 'server/lib/storage.php';

	
	$db = new PersonaStorage();
	$categories = $db->get_categories();
	$page_size = 501;
	
	#Top level popular page
	$popular_list = array_slice($db->get_popular_personas(null), 0, 21);
	foreach ($popular_list as $item)
	{
		$data = extract_record_data($item);
		$data['recent'] = (time() - strtotime($item['approve']) < 604800) ? true : false;
		$popular_json[] = $data;
	}
	$master['popular'] = $popular_json;

	#Top level recent page
	$recent_list = array_slice($db->get_recent_personas(null), 0, 21);
	foreach ($recent_list as $item)
	{
		$data = extract_record_data($item);
		$data['recent'] = (time() - strtotime($item['approve']) < 604800) ? true : false;
		$recent_json[] = $data;
	}
	$master['recent'] = $recent_json;


	foreach ($categories as $category)
	{
		#get category counts for pagination
		$category_total = $db->get_active_persona_count($category);
		$pages = floor($category_total/$page_size) + 1;
		
		$popular_list = array_slice($db->get_popular_personas($category), 0, 10);
	
		$short_cat_list = array();
		foreach ($popular_list as $item)
		{
			$data = extract_record_data($item);
			$data['recent'] = (time() - strtotime($item['approve']) < 604800) ? true : false;
			$short_cat_list[] = $data;
		}
		$category_array[] = array('name' => $category, 'personas' => $short_cat_list);

	}
	$master['categories'] = $category_array;

	file_put_contents(PERSONAS_STORAGE_PREFIX . '/index_1.json', json_encode($master));

	
	
?>