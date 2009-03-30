<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
            "http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Personas For Firefox | Firstrun</title>
	<link href="/store/css/style.css" rel="stylesheet" type="text/css" media="all" />
</head>
<body class="firstrun">
    <div id="outer-wrapper">
        <div id="inner-wrapper">
            <p id="account"></p>
            <div id="nav">
                <h1><a href="http://www.getpersonas.com"><img src="/store/img/logo.png" alt="Mozilla Labs Personas"></a></h1>
                
                <div id="check-it-out">
                    <div class="hd">
                        &nbsp;
                    </div>
                    <p class="bd">
                        Check it out! Your browser's all dressed up.                        
                    </p>
                    <div class="ft">
                        &nbsp;
                    </div>
                </div>
                
            </div>
            <div id="header">
                <h2>Thanks for Installing Personas for Firefox!</h2>
                <h2>The Easiest Way to Dress Up Your Browser.</h2>
            </div>
            
            <div class="feature">
                <h3>Featured Designer</h3>
<?php
	require_once 'lib/personas_constants.php';	
	require_once 'lib/personas_functions.php';	
	require_once 'lib/storage.php';


	$db = new PersonaStorage();
	$persona = $db->get_persona_by_id(FEATURE_DESIGNER_PERSONA_ID); 
	$persona_json = htmlentities(json_encode(extract_record_data($persona)));
	$detail_url = "/store/gallery/persona/" . url_prefix($persona['id']);
?>
					<img class="preview persona" src="<?= PERSONAS_LIVE_PREFIX . '/' . url_prefix($persona['id']) ?>/preview_featured.jpg" persona="<?= $persona_json ?>">
                    <h4><?= $persona['author'] ?></h4>
                    <p class="try"><a href="/store/featured">view more »</a></p>
            </div>
            
            <div class="feature ">
                <h3>Get Started with Personas</h3>
                <ol class="get-started">
                    <li class="one">Click on the fox mask in the lower left corner of your Firefox browser, or go to the Personas page directly from <a href="http://www.getpersonas.com">here</a>.</li>
                    <li class="two">Next, select a Persona from the list, or check out the <a a href="../gallery/All/Popular">Personas gallery</a>.</li>
                    <li class="three">You can change your persona as much as you like! Choose a new one from the list or <a href="https://personas.services.mozilla.com/upload">create your own</a>.</li>
                </ol>
                
                <p>Have a Personas question or comment? Check out our <a href="../faq.html">FAQ</a> section or <a href="https://labs.mozilla.com/forum/?CategoryID=18">discussion
                forum</a>.
                </p>
            </div>
            
            <div class="feature last more">
                <h3>Find out more about Firefox</h3>
                <p>Wondering what to do now? Our <a href="http://en-us.www.mozilla.com/en-US/firefox/central/">Getting Started</a> page has plenty of helpful information.</p>
                <p>Questions? Our <a href="https://labs.mozilla.com/forum/?CategoryID=18">Support page</a> has answers.</p>
                <p>Ready to customize? Now that you’ve got Firefox and Personas, find out more about all the ways you can <a href="https://addons.mozilla.org/en-US/firefox">personalize Firefox</a>!</p>
             
            </div>
            
        </div>
    </div>
    <div id="footer">
        <p>Copyright © 2009 Mozilla. <a href="http://labs.mozilla.com/projects/firefox-personas/">Personas</a> is a <a href="http://labs.mozilla.com">Mozilla Labs</a> experiment. | <a href="http://labs.mozilla.com/about-labs/">About Mozilla Labs</a>    |  <a href="../privacy.html">Privacy</a></p>
    </div>
    <p id="get-more-personas">
       Click on the fox mask to get started!
    </p>
    <script src="/store/js/urchin.js"></script>
</body>
</html>
