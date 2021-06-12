/**
 * @name JSInjector
 * @authorLink https://olejka.ru/
 * @website https://olejka.ru/
 * @source https://github.com/TheSainEyereg/BD-JSInjector-plugin
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/

module.exports = (() => {
    const config = {
        "info":{
            "name":"JavaScript Injector",
            "authors":[
                {
                    "name":"Olejka",
                    "discord_id":"388353045500657674",
                    "github_username":"TheSainEyereg",
                    "twitter_username":"olejka_top4ik"
                }
            ],
            "version":"1.0.1",
            "description":"Simply load JS to Discord without console.",
            "github":"https://github.com/TheSainEyereg/BD-JSInjector-plugin",
            "github_raw":"https://raw.githubusercontent.com/TheSainEyereg/BD-JSInjector-plugin/master/JSInjector.plugin.js"
        },
        "changelog":[
            {
                "title":"Fixed",
                "type":"fixed",
                "items":[
                    "Broken functions because of \"this\""
                ]
            },
            {
                "title":"On-going",
                "type":"progress",
                "items":[
                    "Syntax highlighting.",
                    "Reject jQuery, use pure JS."
                ]
            }
        ],
        "main":"index.js"
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

    const {Logger, Patcher} = Library;


    const menu = {
        active: false,
        open() {
            this.active = true;
            if (!$('#JSI_window')[0]) {
                const menu_html = $(`
                <div id="JSI_window" style="top:30px;left:20px;">
                    <div class="header" id="JSI_window_header">JavaScript Injector
                        <div class="close">✖</div>
                    </div>
                    <div class="main">
                        <div class="side">
                        </div>
                        <div class="editor">
                            <textarea></textarea>
                        </div>
                    </div>
                    <div class="footer">
                        <input type="text" placeholder="Script name">
                        <a>Exec</a>
                    </div>
                </div>
                `);
        
                $('body').append(menu_html);
        
                BdApi.injectCSS('JSI_menu', `
                    :root {
                        --window-background: #282C34;
                        --window-color: #fefefe;
                        --window-misc-background: #333842;
                        --window-misc-color: #414855;
            
                        --header-color: #21252B;
                        --header-height: 16px;
                        --header-padding: 5px;
                        --header: calc(var(--header-height) + var(--header-padding) *2);
            
                        --main-side-color: #21252B;
                        --main-side-width: 33%;
                        --main-editor-padding: 3px;
            
                        --footer-color: var(--header-color);
                        --footer-height: 22px;
                        --footer-padding: 4px;
                        --footer: calc(var(--footer-height) + var(--footer-padding) *2);
                    }
                    #JSI_window {
                        position: absolute;
                        width: 500px;
                        height: 300px;
                        background: var(--window-background);
                        color: var(--window-color);
                        box-shadow: 0 2px 10px 0 #000;
                        z-index: 9999;
                        font-size: 15pt;
                        user-select: none;
                    }
                    #JSI_window ::-webkit-scrollbar {width: 5px; height: 5px;}
                    #JSI_window ::-webkit-scrollbar-track {background: var(--window-misc-background);}
                    #JSI_window ::-webkit-scrollbar-thumb {background: var(--window-misc-color)}
                    #JSI_window .header{
                        position: relative;
                        display: flex;
                        background: var(--header-color);
                        height: var(--header-height);
                        padding: var(--header-padding);
                        font-size: 12pt;
                        cursor: default;
                    }
                    #JSI_window .header .close {
                        position: absolute;
                        right: 0;
                        top: 0;
                        padding: 2px; /*<--Here*/
                        width: 30px;
                        height: calc(100% - (100% - var(--header)) - 2px/*<--There*/ *2); 
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    #JSI_window .header .close:hover {background: var(--status-danger-background);}
                    #JSI_window .header .close:active {opacity: 0.75;}
                    #JSI_window .main{
                        display: flex;
                        position: relative;
                        height: calc(100% - var(--header) - var(--footer));
                    }
                    #JSI_window .main .side {
                        padding: 5px;
                        background: var(--main-side-color);
                        width: var(--main-side-width);
                        overflow-y: auto;
                        overflow-x: hidden;
                    }
                    #JSI_window .main .side .btn{
                        padding: 1px;
                        font-size: 12pt;
                        background: var(--window-misc-color);
                        margin-bottom: 5px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    #JSI_window .main .side .btn:hover{background: #4f5766;}
                    #JSI_window .main .side .btn:active{opacity: 0.75;}
                    #JSI_window .main .editor {
                        user-select: text;
                        padding: 3px;
                        width: calc(100% - var(--main-side-width) - 3px*2);
                        height: calc(100% - 3px *2);
            
                    }
                    #JSI_window .main .editor textarea{
                        font-size: small;
                        width: 100%;
                        height: 100%;
                        padding: 0;
                        resize: none;
                        background: var(--window-bakground-color);
                        color: var(--window-color);
                        border: none;
                        outline: none;
                    }
                    #JSI_window .footer {
                        position: relative;
                        display: flex;
                        background: var(--footer-color);
                        height: var(--footer-height);
                        padding: var(--footer-padding);
                        font-size: 14pt;
                    }
                    #JSI_window .footer input {
                        width: var(--main-side-width);
                        padding: 0;
                        resize: none;
                        background: var(--footer-color);
                        color: var(--window-color);
                        border: 1px solid var(--window-misc-color);
                        outline: none;
                    }
                    #JSI_window .footer input:focus {
                        background: var(--window-misc-background);
                    }
                    #JSI_window .footer a {
                        color: var(--window-color);
                        position: absolute;
                        right: 0;
                        bottom: 0;
                        padding: 3px;
                        height: calc(100% - (100% - var(--footer)) - 3px *2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    #JSI_window .footer a:hover{background: var(--window-misc-color);}
                    #JSI_window .footer a:active{opacity: 0.75;}
                `);
                
                let textbox = $('#JSI_window .footer input');
                let textarea = $('#JSI_window .editor textarea');
                let list = $('#JSI_window .side');
                
                $('#JSI_window .header').on('mousedown', e => {
                    let drag = $('#JSI_window').addClass('drag');
                    height = drag.outerHeight();
                    width = drag.outerWidth();
                    cursor_y = drag.offset().top + height - e.pageY,
                    cursor_x = drag.offset().left + width - e.pageX;
        
                    $('body')
                    .on('mousemove', e => {
                        let itop = e.pageY + cursor_y - height;
                        let ileft = e.pageX + cursor_x - width;
                        if(drag.hasClass('drag')){
                            drag.offset({top: itop,left: ileft});
                        }
                    })
                    .on('mouseup', e => {
                        drag.removeClass('drag');
                    });
                });
        
                $('#JSI_window .header .close').on('click', _ => {menu.close()});
        
                $('#JSI_window .footer a').on('click', _ => {
                    let script = $('<script type="text/javascript"'+ '><'+'/script>');
                    let button = $(`<div class="btn"></div>`);
        
                    if (textarea.val() == '') {return textarea.focus()};
                    if (textbox.val() == '') {textbox.val(`unnamed-${list.children().length +1}`)};
                    textbox.val(textbox.val().replace(/\ /g,'-'));
                    textbox.val(textbox.val().replace(/\\|\/|\.|\,|\:|\;|\"|\'|\`|\#|\$|\&|\_|\+|\*|\=|\||\{|\}|\[|\]|\<|\>|\(|\)|JSI|script/gi,''));
        
                    script.attr('id', `JSIscript_${textbox.val()}`);
                    script.text(textarea.val());
                    button.attr('sid', textbox.val())
                    button.text(textbox.val());
                    textarea.val('');
                    textbox.val('');
                    $('head').append(script);
                    list.append(button);
        
                    button.css('background', 'var(--brand-experiment)'); //--status-danger-background
                    button.text('Executed!');
                    setTimeout(_ => {
                        button.text(button.attr('sid'))
                        button.css('background', '')
                    }, 500)
        
        
                    button.on('click', e => {
                        let btn = $(e.target);
                        let script = $(`#JSIscript_${btn.attr('sid')}`);
                        textarea.val(script.text());
                        btn.css('background', 'var(--status-positive-background)'); //--status-danger-background
                        btn.text('Loaded!');
                        setTimeout(_ => {
                            btn.text(btn.attr('sid'))
                            btn.css('background', '')
                        }, 500)
                    })
                })
            } else $('#JSI_window').show();
        },
        close() {
            this.active = false;
            $('#JSI_window').hide();
        }
    }
    

    function __main__() {
        const title = $('.titleBar-AC4pGV');
        const button = $(`
        <div 
            class="winButtonMinMax-PBQ2gm winButton-iRh8-Z flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs" 
            aria-label="OpenJSI" 
            tabindex="-1" 
            role="button"
            id="JSIButton"
        >JSI</div>
        `);
        title.append(button);

        button.on('click', _ => {if (!menu.active) menu.open(); else menu.close()})
    };


    return class FakeDeafen extends Plugin {
        constructor() {
            super();
        }

        onStart() {
            Logger.log("Started");
            Patcher.before(Logger, "log", (t, a) => {
                a[0] = "Patched Message: " + a[0];
            });

            if (typeof jQuery == 'undefined') {
                if (!document.getElementById('jquery')) {
                    BdApi.linkJS('jquery', 'https://code.jquery.com/jquery-3.5.1.min.js');
                }
                const jquery_id = document.querySelector('#jquery');
                jquery_id.addEventListener('load', _ => __main__());
            } else __main__();
        }

        onStop() {
            Logger.log("Stopped");
            Patcher.unpatchAll();

            menu.close();
            $('#JSI_window').remove();
            $('#JSIButton').remove();
        };
    };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/