let hlodebug = false;
const hloiVer="0.7.5";

const color1='color: #7bf542';  //bright green
const color2='color: #d8eb34'; //yellow green
const color3='color: #ffffff'; //white
const color4='color: #cccccc'; //gray
const color5='color: #ff0000'; //red
var hlo,userToken;
var hloButton=true;

function getActorsWithPlayerOwners() { 
  /*
    Fetch all actors with ownership permissions for players other than the gamemaster
    Output Format:
    [ 
      {
      'id' : actor id,
      'name' : actor name,
      }
    ]
  */
  const OWNER_PERMISSION = 3;
  const GAMEMASTER_ROLE = 4;
  let actors = [];
  for (let actor of game.actors.entries()) {
    for (let permissionEntry of Object.entries(actor[1].data.permission)){
      if (permissionEntry[1]>=OWNER_PERMISSION && game.users.get(permissionEntry[0]).data.role<GAMEMASTER_ROLE){
        actors.push({
          id : actor[0],
          name : actor[1].data.name
        });
        break; // Push the first time a non-gm owner is encountered
      }
    }
  }
  console.log("%cHLO Importer | %cSettings options will be created for "+actors.length+" actors",color1,color4);
  return actors;
}

function buildSettingObjectForActor(actorRecords) {
  // Individual setting obj for a single actor. Accepts array as returned by getActorsWithPlayerOwners
  for (let record of actorRecords) {
    let settingObj = {
      name : record["name"]+" : "+record["id"],
      hint : "Enter the element token for this character, or leave blank",
      scope : 'world',
      config : true,
      type : String,
      default : '',
    };
    game.settings.register('hlo-importer', record["id"], settingObj);
  }
}

Hooks.on('ready', async function() {
  if (game.system.id!="pf2e") {
    console.log("%cHLO Importer | %cWrong game system. %cNot enabling.",color1,color5,color4);
  } else {
    console.log("%cHLO Importer | %cinitializing",color1,color4);
      game.settings.register('hlo-importer', 'userToken', {
          name : "User Token (optional)",
          hint : "Please enter your personal user token. A user token allows external tools (like this one) to access the HLO server and perform export operations.",
          scope : 'world',
          config : true,
          type : String,
          default : '',
          onChange: value => (userToken=game.settings.get('hlo-importer', 'userToken'))
      });

      // Individual setting, allows you to enter a different token for each actor that has a player as an owner. A bit hacky.
      // Setting key is the actor ID, and value is the character token supplied by user
      buildSettingObjectForActor(getActorsWithPlayerOwners());

      game.settings.register('hlo-importer', 'debugEnabled', {
          name : "Enable debug mode",
          hint : "Debug output will be written to the js console.",
          scope : 'world',
          config : true,
          type: Boolean,
          default: false,
          onChange: value => (hlodebug=game.settings.get('hlo-importer', 'debugEnabled'))
      });
  }
  hlo = new HeroLabImporter(hlodebug);
  hlodebug=game.settings.get('hlo-importer', 'debugEnabled');
  userToken=game.settings.get('hlo-importer', 'userToken')
});

Hooks.on('herovaultfoundryReady', (api) => {
  if (hlodebug)
    console.log("Disabling HLO button since herovault is loaded");
  hloButton=false;
});

Hooks.on('renderActorSheet', function(obj, html){
  hlodebug = game.settings.get('hlo-importer', 'debugEnabled');
  if (game.system.id!="pf2e") {
    console.log("%cHLO Importer | %cWrong game system. %cNot adding HLO button to actor sheet.",color1,color5,color4);
  } else {
    // Only inject the link if the actor is of type "character" and the user has permission to update it
      const actor = obj.actor;
      if (hlodebug) {
        console.log("%cHLO Importer | %cPF2e System Version: hlo-importer actor type: " + actor.data.type,color1,color4);
        console.log("%cHLO Importer | %cCan user modify: " + actor.canUserModify(game.user, "update"),color1,color4);
      }

      if (!(actor.data.type === "character")){ return;}
      if (actor.canUserModify(game.user, "update")==false){ return;}
      
      if (hloButton) {
        let element = html.find(".window-header .window-title");
        if (element.length != 1) {return;}
        
        let button = $(`<a class="popout" style><i class="fas fa-flask"></i>HLO</a>`);
        userToken = game.settings.get('hlo-importer', 'userToken');
        if (hlodebug) {
          console.log("%cHLO Importer | %chlo-importer token: "+ userToken,color1,color4);
        }
        button.on('click', () => hlo.beginHLOImport(obj.object,userToken));
        element.after(button);
      }
    }
  }
);

async function doHVExport(hero,act) {
  game.modules.get('herovaultfoundry')?.api?.exportToHVFromPBHLO(hero,act);
  // if (game.modules.get('herovaultfoundry')?.active){
  //   let {exportToHVFromPBHLO} = await import('../herovaultfoundry/herovault-min.js');
  //   if (typeof exportToHVFromPBHLO !== "undefined") {
  //     exportToHVFromPBHLO(hero,act);
  //   }
  // }  
  // return;
}

export function hloShim(targetActor) {
   let hlo = new HeroLabImporter;
    hlo.heroVaultPrompt=true;
    userToken = game.settings.get('hlo-importer', 'userToken');
    let x = hlo.beginHLOImport(targetActor,userToken);
}

export function hloActive() {
  return true;
}

export class HeroLabImporter {
  constructor(hlodebug) {
    this.color1='color: #7bf542';  //bright green
    this.color2='color: #d8eb34'; //yellow green
    this.color3='color: #ffffff'; //white
    this.color4='color: #cccccc'; //gray
    this.color5='color: #ff0000';
    this.hlodebug = hlodebug;
    this.heroVaultExport=false;
    this.heroVaultPrompt=false;
    this.numSheets = 0;
    this.currentSheet = 0;
  }

  beginHLOImport(targetActor,userToken){
    let applyChanges=false;
    let hvCheckbox="";
    if (this.heroVaultPrompt) {
      hvCheckbox='<br><input type="checkbox" id="checkBoxHVExport" name="checkBoxHVExport" ><label for="checkBoxHVExport"> Export this PC to my HeroVau.lt</label><br>';
    }
    new Dialog({
      title: `Herolab Online Import`,
      content: `
        <div>
          <p>Step 1: Get the character token by clicking on the kebab menu (<strong>⋮</strong>) on any character on your account. Scroll down to "Element Token" and click the <strong>Get Element Token</strong> button. Click the <strong>Copy to Clipboard</strong> button.</p>
          <p>Step 2: Paste the Element Token from the Herolab Online export dialog below</p>
          <br>
          <p>Please note - items which cannot be matched to the Foundry database will not be imported!<p>
        <div>
        <hr/>
        <div id="divCode">
          Enter the element token of the character you wish to import<br>
          <div id="divOuter">
            <div id="divInner">
              <input id="textBoxElementID" type="text" maxlength="14" />
            </div>
          </div>
        </div>
        ${hvCheckbox}
        <br><br><strong>Once you click Import, please be patient as the process might take up to 45 seconds to complete.</strong><br><br>
        <style>
        
          #textBoxElementID {
              border: 0px;
              padding-left: 5px;
              letter-spacing: 2px;
              width: 330px;
              min-width: 330px;
            }
            
            #divInner{
              left: 0;
              position: sticky;
            }
            
            #divOuter{
              width: 285px; 
              overflow: hidden;
            }
    
            #divCode{  
              border: 1px solid black;
              width: 300px;
              margin: 0 auto;
              padding: 5px;
            }
    
        </style>
        `,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: `Import`,
          callback: () => applyChanges = true
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: `Cancel`
        },
      },
      default: "yes",
      close: html => {
        if (applyChanges) {
          let HLOElementID= html.find('[id="textBoxElementID"]')[0].value;

          if (html.find('[id="checkBoxHVExport"]').length) {
            if (hlodebug)
              console.log("%cHLO Importer | %cevalue of hloexport check: "+html.find('[id="checkBoxHVExport"]')[0].value,color1,color4);
            if (html.find('[id="checkBoxHVExport"]')[0].checked)
              this.heroVaultExport=true;
            else
              this.heroVaultExport=false;
          }

          this.asyncConvertHLOCharacter(targetActor, HLOElementID,userToken);
        }
      }
    }).render(true);

  }

  asyncConvertHLOCharacter(targetActor, HLOElementID, userToken){
      var { pf2eVersion, xmlhttp } = this.prepareSheetRequest(targetActor);
      if (hlodebug) {
        console.log("%cHLO Importer | %cusertoken: " + userToken,color1,color4);
        console.log("%cHLO Importer | %cPF2e System Version: " + pf2eVersion,color1,color4);
      }
      if (userToken == "") {
        xmlhttp.open("GET", "https://www.pf2player.com/foundrymodule.php?elementID="+encodeURIComponent(HLOElementID)+"&pf2e="+pf2eVersion+"&hloi="+hloiVer, true);
      }
      else {
        xmlhttp.open("GET", "https://www.pf2player.com/foundrymodule.php?elementID="+encodeURIComponent(HLOElementID)+"&pf2e="+pf2eVersion+"&hloi="+hloiVer+"&userToken="+encodeURIComponent(userToken), true);
      }
      xmlhttp.send();
      return 0;
  }

  prepareSheetRequest(targetActor) {
    const pf2eVersion = game.data.system.data.version;
    let error = false;
    var self = this;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let responseJSON = JSON.parse(this.responseText);
        if (hlodebug) {
          console.log("%cHLO Importer | %cResponse JSON:", color1, color4, responseJSON);
        }
        if (responseJSON.hasOwnProperty("error")) {
          if (hlodebug) {
            console.log("%cHLO Importer | %cerror found in response", color1, color4);
          }
          error = true;
        } else {
          if (hlodebug) {
            console.log("%cHLO Importer | Response length: %c" + Object.keys(responseJSON.characterData).length, color1, color4);
          }
        }

        if (error) {
          new Dialog({
            title: `Herolab Online Import`,
            content: `
                   <div>
                      <h3>Error</h3>
                      <p>${responseJSON.error}<p>
                   </div><br>`,
            buttons: {
              yes: {
                icon: "<i class='fas fa-check'></i>",
                label: `Ok`
              }
            },
            default: "yes"
          }).render(true);
        } else {
          if (Object.keys(responseJSON.characterData).length > 1) {
            if (hlodebug) {
              console.log("%cHLO Importer | %cCalling checkHLOCharacterIsCorrect", color1, color4);
            }
            self.checkHLOCharacterIsCorrect(targetActor, responseJSON);
          } else {
            ui.notifications.warn("Unable to convert. Please file a bug with the Conversion ID: " + responseJSON.ConversionID);
          }
        }
      }
    };
    return { pf2eVersion, xmlhttp };
  }

  checkHLOCharacterIsCorrect(targetActor,responseJSON){
    if (hlodebug ){
      console.log("%cHLO Importer | %cin checkHLOCharacterIsCorrect",color1,color4);
      console.log("%cHLO Importer | %c"+responseJSON,color1,color4);
    }
    let correctCharacter = false;
    let charImport = responseJSON.characterData;
    const conversionData=responseJSON.conversionData;
    new Dialog({
      title: charImport.name,
      content: `
        <div><h2>Conversion Log:<br>`+responseJSON.conversionData+`</div><br><div><strong>Continue importing `+charImport.name+`, level `+charImport.data.details.level.value+` `+charImport.data.details.class.value+`?</strong></div><br><br>
        `,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: `Proceed`,
          callback: () => correctCharacter = true
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: `Cancel`
        },
      },
      default: "yes",
      close: html => {
        // Wait until user acknowledges dialog before beginning next request
        if (hlo.numSheets>0) {hlo.currentSheet=hlo.currentSheet+1;}
        if (hlodebug){
          console.log("%cHLO Importer | %cCall next hook for sheet num "+hlo.currentSheet, color1, color4);
        }
        if (hlo.numSheets>0 && hlo.currentSheet<=hlo.numSheets) {Hooks.call('convert'+hlo.currentSheet);} // Call next hook if relevant
        if (hlo.currentSheet==hlo.numSheets) {hlo.currentSheet=0; hlo.numSheets=0;}
        if (correctCharacter) {
          this.importHLOCharacter(targetActor, charImport);
        }
      }
    }).render(true);
  }

  async importHLOCharacter(targetActor, charImport){
    let importPCID=new RegExp(charImport._id, "g");
    let targetPCID=targetActor.data._id;
    var targetActor = await targetActor;
    let charDataStr=JSON.stringify(charImport);
    charDataStr=charDataStr.replace(importPCID,targetPCID);
    charImport=JSON.parse(charDataStr);
    if (hlodebug) {
      console.log("%cHLO Importer | %c Importing "+charImport.name,color1,color4);
      console.log("%cHLO Importer | %c targetActor:",color1,color4, targetActor);
      console.log("%cHLO Importer | %c HV export: "+this.heroVaultExport,color1,color4);
    }
    targetActor.deleteEmbeddedDocuments('Item', ["123"],{deleteAll: true});
    targetActor.importFromJSON(JSON.stringify(charImport));
    
    if (this.heroVaultExport) {
      if (hlodebug)
        console.log("%cHLO Importer | %cperforming a HeroVau.lt Export",color1,color4);
      doHVExport(JSON.stringify(charImport),targetActor)
    }
  }
}

Hooks.on('init', () => {
    game.modules.get('hlo-importer').api = {
    hloShim: hloShim,
    hloActive: hloActive
  };
  Hooks.callAll('hloimporterReady', game.modules.get('hlo-importer').api);
});

Hooks.on('chatCommandsReady', function(chatCommands){
    chatCommands.registerCommand(chatCommands.createCommandFromData({
      commandKey: "/update_users",
      invokeOnCommand: (chatlog, messageText, chatdata) => {
        console.log("Updating character sheets");
        userToken = game.settings.get('hlo-importer', 'userToken');
        let charToken
        let validActors = game.actors.filter((actor)=>Object.entries(actor.data.permission).some( (perm)=>{return perm[0]!=game.userId&&perm[1]>2} ));
        
        console.log("Total sheets to update: "+validActors.length);
        for (let actor of validActors) {
          charToken = game.settings.get('hlo-importer', actor._id);
          if (charToken!=''){
            // Request character conversions with Workers to run get requests synchronously. Endpoints don't like rapid/paralllel requests, need to be patient w/ http requests
            console.log("Creating hook to update this actor object using this token: "+charToken,actor)
            let callback = hlo.asyncConvertHLOCharacter.bind(hlo, actor, charToken, userToken);
            Hooks.once('convert'+hlo.numSheets, callback);
            hlo.numSheets = hlo.numSheets+1;
          } else {
            console.log("Skipping "+actor.name+", no token found.")
          }
        }
        Hooks.call('convert'+hlo.currentSheet);
      },
      shouldDisplayToChat: false,
      iconClass: "fa-sticky-note",
      description: "Update character sheets",
      gmOnly:true
    }));
});