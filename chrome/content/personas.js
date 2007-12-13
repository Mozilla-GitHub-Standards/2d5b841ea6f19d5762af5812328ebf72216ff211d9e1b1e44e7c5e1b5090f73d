/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Personas.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Chris Beard <cbeard@mozilla.org>
 *   Myk Melez <myk@mozilla.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const PERSONAS_VERSION = "0.9";

var PersonaController = {
  //**************************************************************************//
  // Shortcuts

  // Preference Service
  get _prefSvc() {
    var prefSvc = Cc["@mozilla.org/preferences-service;1"].
                  getService(Ci.nsIPrefBranch);
    delete this._prefSvc;
    this._prefSvc = prefSvc;
    return this._prefSvc;
  },

  // Persona Service
  get _personaSvc() {
    var personaSvc = Cc["@mozilla.org/personas/persona-service;1"].
             getService(Ci.nsIPersonaService);
    delete this._personaSvc;
    this._personaSvc = personaSvc;
    return this._personaSvc;
  },

  get _stringBundle() {
    var stringBundle = document.getElementById("personasStringBundle");
    delete this._stringBundle;
    this._stringBundle = stringBundle;
    return this._stringBundle;
  },

  get _menu() {
    var menu = document.getElementById("personas-selector-menu");
    delete this._menu;
    this._menu = menu;
    return this._menu;
  },

  /**
   * Get the value of a pref, if any; otherwise, get the default value.
   *
   * @param   prefName
   * @param   defaultValue
   * @returns the value of the pref, if any; otherwise, the default value
   */
  _getPref: function(prefName, defaultValue) {
    var prefSvc = this._prefSvc;

    try {
      switch (prefSvc.getPrefType(prefName)) {
      case Ci.nsIPrefBranch.PREF_STRING:
        return prefSvc.getCharPref(prefName);
      case Ci.nsIPrefBranch.PREF_INT:
        return prefSvc.getIntPref(prefName);
      case Ci.nsIPrefBranch.PREF_BOOL:
        return prefSvc.getBoolPref(prefName);
      }
    }
    catch (ex) {}

    return defaultValue;
  },

  // FIXME: for performance, make this a memoizing getter with a pref listener
  // that updates it as the pref changes.
  get _currentPersona() {
    return this._getPref("extensions.personas.selected", "default");
  },

  get _baseURL() {
    return this._getPref("extensions.personas.url");
  },

  get _locale() {
    switch(this._getPref("general.useragent.locale", "en-US")) {
      case 'ja':
      case 'ja-JP-mac':
        return "ja";
      default:
        return "en-US";
    }
  },

  //**************************************************************************//
  // Initialization

  startUp: function() {
    // Get the persona service to ensure it gets initialized and starts updating
    // the lists of categories and personas on a regular basis.
    Cc["@mozilla.org/personas/persona-service;1"].getService();

    // Check for a first run or updated extension and display some additional
    // information to users.
    var firstRun = this._getPref("extensions.personas.lastversion"); 
    if (firstRun == "firstrun") {
      var firstRunURL = this._baseURL + this._locale + "/firstrun/?version=" + PERSONAS_VERSION;
      setTimeout(function() { window.openUILinkIn(firstRunURL, "tab") }, 500);
      this._prefSvc.setCharPref("extensions.personas.lastversion", PERSONAS_VERSION);
    }
    else if (firstRun != PERSONAS_VERSION) {
      var updatedURL = this._baseURL + this._locale + "/updated/?version=" + PERSONAS_VERSION;
      setTimeout(function() { window.openUILinkIn(updatedURL, "tab") }, 500);
      this._prefSvc.setCharPref("extensions.personas.lastversion", PERSONAS_VERSION);
    }

    // Apply the current persona to the browser theme.
    this._updateTheme();

    // Observe changes to the selected persona that happen in other windows
    // or by users twiddling the preferences directly.
    this._prefSvc.QueryInterface(Ci.nsIPrefBranch2).
                  addObserver("extensions.personas.", this, false);
  },

  shutDown: function() {
    this._prefSvc.QueryInterface(Ci.nsIPrefBranch2).
                  removeObserver("extensions.personas.", this);
  },

  // nsISupports
  QueryInterface: function(aIID) {
    if (aIID == Ci.nsIObserver || aIID == Ci.nsISupports)
      return this;

    throw Cr.NS_ERROR_NO_INTERFACE;
  },

  // nsIObserver
  observe: function(subject, topic, data) {
    switch (topic) {
      case "nsPref:changed":
        switch (data) {
          case "extensions.personas.selected":
          case "extensions.personas.manualPath":
          case "extensions.personas.category":
            this._updateTheme();
            break;
        }
        break;
    }
  },

  /**
   * Set the current persona to the one with the specified ID.
   *
   * @param personaID the ID of the persona to set as the current one.
   */
  _setPersona: function(personaID, categoryID) {
    // Update the list of recent personas.
    if (personaID != this._currentPersona && this._currentPersona != "random") {
      this._prefSvc.setCharPref("extensions.personas.lastselected2",
                                this._getPref("extensions.personas.lastselected1"));
      this._prefSvc.setCharPref("extensions.personas.lastselected1",
                                this._getPref("extensions.personas.lastselected0"));
      this._prefSvc.setCharPref("extensions.personas.lastselected0", this._currentPersona);
    }

    // Save the new selection to prefs.
//  this._prefSvc.setBoolPref("extensions.personas.selectedIsDark", dark);
    this._prefSvc.setCharPref("extensions.personas.selected", personaID);
    this._prefSvc.setCharPref("extensions.personas.category", categoryID);
  },

  _getDarkPropertyByPersona: function(personaID) {

     // FIXME: temporary hack to get around slow loading on initialization     
     if(!this._personaSvc.personas)
       return false;

     var personas = this._personaSvc.personas.wrappedJSObject;

     for(var i = 0; i < personas.length; i++) {
        if(personas[i].id == personaID) {
		if(personas[i].dark == "true")
                  return true;
                if(!personas[i].dark || personas[i].dark == "false")
                  return false;
        }
     }
    
     return false;
  },

  _getRandomPersonaByCategory: function(currentPersona, categoryID) {
      var personas = this._personaSvc.personas.wrappedJSObject;
      var subList = new Array();
      var k = 0;

    // Build the list of possible personas to select from
      for (var j = 0; j < personas.length; j++) {
        var persona = personas[j];
        var needle = categoryID;
        var haystack = persona.menu;

        if (haystack.search(needle) == -1)
          continue;

	subList[k++] = persona;
      }

    // Get a random item, trying up to five times to get one that is different
    // from the currently-selected item in the category (if any).
    // We use Math.floor instead of Math.round to pick a random number because
    // the JS reference says Math.round returns a non-uniform distribution
    // <http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Math:random#Examples>.
    var randomIndex, randomItem;
    for (var i = 0; i < 5; i++) {
      randomIndex = Math.floor(Math.random() * (subList.length));
      randomItem = subList[randomIndex];
      if(randomItem.id != currentPersona);
        break;
    }

    return randomItem.id; 
  },


  
  // FIXME: update the menu item to display the persona name as its label.
  _updateTheme: function() {
    var personaID = this._getPref("extensions.personas.selected");
  
    // if a random persona has been selected, pick the next one from the category
    // first check to ensure that the personas list has been updated by the service,
    // as this sometimes does not work when you start up if your network
    // connection is slow

    if(personaID == "random") {
      if(this._personaSvc.personas) {
        var categoryID = this._getPref("extensions.personas.category");
        personaID = this._getRandomPersonaByCategory(personaID, categoryID);
        this._prefSvc.setCharPref("extensions.personas.lastrandom", personaID);
      } else { 
        var personaID = this._getPref("extensions.personas.lastrandom");
      }
    }

    var isDark = this._getDarkPropertyByPersona(personaID);

    // Style the primary toolbar box, adding the new background image.
    var toolbar = document.getElementById("main-window");
    toolbar.style.MozAppearance = "none";
    toolbar.style.backgroundImage = "url('" + this._getToolbarURL(personaID) + "')";
    toolbar.style.backgroundRepeat = "no-repeat";
    toolbar.style.backgroundPosition = "top right";
    // Change text color to reflect dark vs. light personas as advertised by feed.
    toolbar.setAttribute("_personas-dark-style", isDark ? "true" : "");

    statusbar = document.getElementById("status-bar");
    if (statusbar) {
      statusbar.style.MozAppearance = "none";
      if (personaID != "manual")
        statusbar.style.backgroundImage = "url('" + this._getStatusbarURL(personaID) + "')";
      statusbar.style.backgroundRepeat = "no-repeat";
      statusbar.style.backgroundPosition = "top left";
      statusbar.style.backgroundColor = "transparent";
    }

    // Mac-specific code to style the tabbox.
    if (navigator.platform.toLowerCase().indexOf("mac") != -1) {
      var tabbrowser = document.getElementById("content");
      if(tabbrowser.mTabContainer)
        tabbrowser.mTabContainer.style.background = "transparent";
      if(tabbrowser.mStrip)
        tabbrowser.mStrip.style.MozAppearance = "none";
    }

    var urlbar = document.getElementById("urlbar");
    if (urlbar)
      urlbar.style.opacity = "0.8";

    var searchbar = document.getElementById("searchbar");
    if (searchbar)
      searchbar.style.opacity = "0.8";
  },

  _getToolbarURL: function(personaID) {
    switch (personaID) {
      case "default":
        return "chrome://personas/skin/default/tbox-default.jpg";
      case "manual":
        return "file://" + this._prefSvc.getCharPref("extensions.personas.manualPath");
      default:
        return this._baseURL + "skins/" + personaID + "/tbox-" + personaID + ".jpg";
    }
  },

  _getStatusbarURL: function(personaID) {
    if (personaID == "default")
      return "chrome://personas/skin/default/stbar-default.jpg";

    return this._baseURL + "skins/" + personaID + "/stbar-" + personaID + ".jpg";
  },

  onPersonaPopupShowing: function(event) {
    if (event.target != this._menu)
      return;

    var categories = this._personaSvc.categories.wrappedJSObject;
    var personas = this._personaSvc.personas.wrappedJSObject;

    this._rebuildMenu(categories, personas);
  },

  _getCategoryName : function(category_id) {
   var categories = this._personaSvc.categories.wrappedJSObject;
   for(var i in categories) {
     if(categories[i].id == category_id) {
       return categories[i].label;
     }
   }
   return "(unknown)";
  },

  _getPersonaName : function(persona_id) {
    var personas = this._personaSvc.personas.wrappedJSObject;
    var stringsBundle = document.getElementById("personasStringBundle");
    var defaultString = stringsBundle.getString("Default");
 
    if(persona_id == "default") {
                        return defaultString;
    }

    for(var i in personas) {
      if(personas[i].id == persona_id) {
        return personas[i].label;
      }
     }
 
    return defaultString;
  },


  _rebuildMenu: function(categories, personas) {
    var openingSeparator = document.getElementById("personasOpeningSeparator");
    var closingSeparator = document.getElementById("personasClosingSeparator");

    // Remove everything between the two separators.
    while (openingSeparator.nextSibling && openingSeparator.nextSibling != closingSeparator)
      this._menu.removeChild(openingSeparator.nextSibling);

//    document.getElementById("personas-default").disabled = (this.currentPersona == "default");

    var personaStatus = document.getElementById("persona-current");
    if(this._currentPersona == "random") {
       personaStatus.setAttribute("class", "menuitem-iconic");
       personaStatus.setAttribute("image", "chrome://personas/skin/random-feed-16x16.png");
       personaStatus.setAttribute("label", this._stringBundle.getString("useRandomPersona.label") + " " + this._getCategoryName(this._getPref("extensions.personas.category"))+ " : " + this._getPersonaName(this._getPref("extensions.personas.lastrandom")));
    } else {
       personaStatus.removeAttribute("class");
       personaStatus.removeAttribute("image");
       personaStatus.setAttribute("label", this._getPersonaName(this._currentPersona));
    }

    document.getElementById("personas-manual-separator").hidden =
    document.getElementById("personas-manual").hidden = (this._getPref("extensions.personas.editor") != "manual");

    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];

      var menu = document.createElement("menu");
      menu.setAttribute("label", category.label);

      var popupmenu = document.createElement("menupopup");
      popupmenu.setAttribute("id", category.id);

      switch(category.type) {
        case "list":
          for (var j = 0; j < personas.length; j++) {
            var persona = personas[j];

            var needle = category.id;
            var haystack = persona.menu;
            if (haystack.search(needle) == -1)
              continue;

            var item = this._createPersonaItem(persona, category.id);
            popupmenu.appendChild(item);
          }

          // Create an item that picks a random persona from the category.
	  item = document.createElement("menuseparator");
          popupmenu.appendChild(item);

          item = document.createElement("menuitem");
	  item.setAttribute("personaid", "random");
	  item.setAttribute("categoryid", category.id);
	  item.setAttribute("class", "menuitem-iconic");
	  item.setAttribute("image", "chrome://personas/skin/random-feed-16x16.png");
          item.setAttribute("label", this._stringBundle.getString("useRandomPersona.label") + " " + category.label);
          item.setAttribute("oncommand", "PersonaController.onSelectPersona(event.target);");
          popupmenu.appendChild(item);

          break;

        case "recent":
          for (var k = 0; k < 3; k++) {
            var recentID = this._getPref("extensions.personas.lastselected" + k);
            if (!recentID)
              continue;

            // Find the persona whose ID matches the one in the preference.
             for (var x = 0; x < personas.length; x++) {
                 if(personas[x].id == recentID) {
            		var item = this._createPersonaItem(personas[x], "");
            		popupmenu.appendChild(item);
                        break;
                  }
	     }

          }
          break;
      }

      menu.appendChild(popupmenu);

      if (categories[i].parent == "top")
        this._menu.insertBefore(menu, closingSeparator);
      else {
        var categoryMenu = document.getElementById(categories[i].parent);
        categoryMenu.insertBefore(menu, categoryMenu.firstChild);
      }
    }
  },

  _createPersonaItem: function(persona, categoryid) {
    var item = document.createElement("menuitem");

    // We store the ID of the persona in the "personaid" attribute instead of
    // the "id" attribute because "id" has to be unique, and personas sometimes
    // are associated with multiple menuitems (f.e. one in the Recent menu
    // and another in a category menu).
    item.setAttribute("personaid", persona.id);
    item.setAttribute("label", persona.label);
    item.setAttribute("type", "checkbox");
    item.setAttribute("checked", (persona.id == this._currentPersona));
    item.setAttribute("autocheck", "false");
    item.setAttribute("categoryid", categoryid);
    item.setAttribute("oncommand", "PersonaController.onSelectPersona(event.target);");

    return item;
  },

  onSelectPersona: function(menuitem) {
    var personaID = menuitem.getAttribute("personaid");
    var categoryID = menuitem.getAttribute("categoryid");
    this._setPersona(personaID, categoryID);
  },

  onSelectManual: function(event) {
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
    fp.init(window, "Select a File", Ci.nsIFilePicker.modeOpen);
    var result = fp.show();
    if (result == Ci.nsIFilePicker.returnOK) {
      this._prefSvc.setCharPref("extensions.personas.manualPath", fp.file.path);
      this._setPersona("manual", "");
    }
  },

  onSelectAbout: function(event) {
    window.openUILinkIn(this._baseURL + this._locale + "/about/?persona=" + this._currentPersona, "tab");
  }

};

window.addEventListener("load", function(e) { PersonaController.startUp(e); }, false);
window.addEventListener("unload", function(e) { PersonaController.shutDown(e); }, false);