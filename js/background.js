/**
* autobookmarks.txusko.com
* chrome extension - released under MIT License
* Author: Javi Filella <txusko@gmail.com>
* http://github.com/txusko/PostItAll
* Copyright (c) 2015 Javi Filella
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*
*/

import { createSweetNotes } from './createSweetNotes.js';
import { exportRemoteUserNotes } from './exportSweetNotes.js';


var backgroundPage = {};

//Mouse position
var mousePosition = null;

//Event fired with each new page visit
backgroundPage._OnUpdated = function(tabid, changeinfo, tab) {
  //Check for completed requests
  if (changeinfo.status == "complete" && functs.checkUrl(tab.url)) {
    console.log("restore:", tab.url);
    abm.sendMessage('hide');
    //Restore storage options
    abm._Restore(function() {
      console.log("init:", tab.url);
      backgroundPage._Init(tab);
    });
  }
}

backgroundPage._GetNumberOfPostits = function() {
    chrome.tabs.getSelected(null,function(tab) {
        chrome.browserAction.setBadgeText({text: ""});
        if(chrome.runtime.lastError !== undefined) { console.log('Error checkLoaded', chrome.runtime.lastError); return; }
        if (tab && abm.state && functs.checkUrl(tab.url)) {
            setTimeout(function(){
                chrome.tabs.executeScript(tab.id, { code: "if (typeof lengthPostits !== 'undefined') { lengthPostits(); }" });
            }, 500);
        }
    });
}

backgroundPage._Init = function(tab) {

    //Check state
    if(!abm.state) { console.log('Extension stopped!'); return; }

    //Jquery
    if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
    chrome.tabs.executeScript(tab.id, { file: "js/jquery-3.5.1.min.js" }, function() {
        //UI
        if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
        chrome.tabs.insertCSS(tab.id, {file: "css/jquery-ui-1.10.0.custom.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/jquery-ui-timepicker-addon.min.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/trumbowyg.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/trumbowyg.smallicons.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/jquery.minicolors.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/jquery.postitall.css"});
        chrome.tabs.insertCSS(tab.id, {file: "css/shapes.css"});
        chrome.tabs.executeScript(tab.id, { file: "js/jquery-ui-1.10.1.min.js" }, function() {
            chrome.tabs.executeScript(tab.id, { file: "js/jquery-ui-timepicker-addon.min.js" });
            chrome.tabs.executeScript(tab.id, { file: "js/trumbowyg.js" }, function() {
                chrome.tabs.executeScript(tab.id, { file: "js/jquery.htmlclean.js" }, function() {
                    //CSS
                    if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                    //Minicolors
                    chrome.tabs.executeScript(tab.id, { file: "js/jquery.minicolors.js" }, function() {
                      //Postitall plugin
                      if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                      chrome.tabs.executeScript(tab.id, { file: "js/jquery.postitall.js" }, function() {
                          chrome.tabs.executeScript(tab.id, { file: "js/jquery.postitall.chromeManager.js" }, function() {
                          //Execute
                          if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                          chrome.tabs.executeScript(tab.id, { file: "js/loadpostits.js" }, function() {
                              if(chrome.runtime.lastError !== undefined) { console.log('Error loading PIA', chrome.runtime.lastError); return; }
                              functs.delay(function(){
                                  backgroundPage._SetEnv(tab.windowId)
                                  backgroundPage._LoadAll(tab.url);
                              }, 200);
                          });
                        });
                      });
                    });
                });
            });
        });
    });
}

backgroundPage._LoadAll = function(url) {
    abm._Restore(function() {
        abm.sendMessage('init');
        if(abm.autoloadEnabled) {
            var id = parseInt(functs.getUrlParameter('highlightNote', url), 10);
            if(!isNaN(id)) {
                abm.sendMessage('load', id);
            } else {
                abm.sendMessage('show', '');
            }
        } else {
            console.log('Autoload disabled!');
            backgroundPage._GetNumberOfPostits();
        }
    });
};

backgroundPage._SetEnv = function(windowId) {
    return;
    chrome.tabs.getSelected(windowId,function(tab) {
        var isUrl = functs.checkUrl(tab.url);
        abm.setIcon(false, isUrl);
        if(abm.state && isUrl) {
            abm.setIcon(true, isUrl);
        }
    });
};

backgroundPage.captureScreenShot = function(){
  chrome.tabs.getSelected(null,function(tab) {
    chrome.tabs.captureVisibleTab(null, {}, function(img) {
        var domain = functs.getUniqueId(tab.url);
        if(domain !== "") {
            //Recover data
            var varname = "screenshots";
            var varvalue = localStorage.getItem(varname);
            if(varvalue != null) {
                varvalue = JSON.parse(varvalue);
            } else {
                varvalue = [];
            }
            //Remove previos screenshot if it exists
            for(var i = 0; i < varvalue.length; i++) {
                if(varvalue[i].domain === domain) {
                    varvalue.remove(i);
                    break;
                }
            }
            //Create new screenshot page
            var page = { url: tab.url, domain: domain, img: img, notes: [] };
            varvalue.push(page);
            var testPrefs = JSON.stringify(varvalue);
            //Save all screenshots in localstorage
            localStorage.setItem(varname, testPrefs);
        } else {
            console.log('wrong domain', tab.url);
        }
    });
  });
}

backgroundPage._ReloadAll = function() {
  return;

    //chrome.tabs.create({url: chrome.extension.getURL("options.html")});
    chrome.tabs.query({}, function (tabs) {
        var myTabs = [];
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.indexOf('http') === 0) {
                myTabs.push(tabs[i].id);
            }
        }
        for (var i = 0; i < myTabs.length; i++) {
            chrome.tabs.reload(myTabs[i]);
        }
    });
};

backgroundPage._SetContextMenu = function(cmId, title, contexts, callback) {
  chrome.contextMenus.create({
    'id'  : 'idContextMenuPIA' + cmId,
    'title' : title,
    'contexts' : contexts
  });
};

var contextMenuListener = false;
backgroundPage._SetContextMenuActions = function() {
    if(contextMenuListener)
        return;
    chrome.contextMenus.onClicked.addListener(function(e) {
        //Action
        var action;
        if(e.menuItemId == "idContextMenuPIA1" || e.menuItemId == "idContextMenuPIA3") {
            action = "new2";
        } else {
            action = "newdashboard";
        }
        //Content
        var content = "";
        if(e.menuItemId == "idContextMenuPIA1" || e.menuItemId == "idContextMenuPIA2") {
            content = "&nbsp;";
        } else {
            if (e.selectionText) {
                content = e.selectionText.replace(/'/g,"\\'");
            }
        }
        abm.sendMessage(action, content);
    });
    contextMenuListener = true;
};

//When new tab is loaded
chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
  backgroundPage._OnUpdated(tabid, changeinfo, tab);
  backgroundPage._SetContextMenuActions();
});
//When a tab is activated
chrome.tabs.onActivated.addListener(function(activeInfo) {
    if(!abm.state) { console.log('Extension stopped!'); return; }
    if(!abm.autoloadEnabled) { console.log('Autoload disabled!'); return; }
    functs.delay(function(){
      abm.sendMessage('checkLoaded', 'all');
      backgroundPage._SetContextMenuActions();
    }, 200);
});
//When a tab is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {

});
//When the extension finished installing
chrome.runtime.onInstalled.addListener(function (object) {
    console.log('Created context menu!');
    backgroundPage._SetContextMenu(3, 'New note with selected text', ['selection']);
    backgroundPage._SetContextMenu(4, 'New note with selected text in dashboard', ['selection']);
    backgroundPage._SetContextMenu(1, 'New blank note', ['page', 'selection']);
    backgroundPage._SetContextMenu(2, 'New blank note in dashboard', ['page', 'selection']);
    backgroundPage._SetContextMenuActions();
});

//Get messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    abm._OnMessage(request, sender, sendResponse);
});

// 自动导出便签的函数
function autoExportNotes() {
    try {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(!tabs[0]) return;
            
            const tab = tabs[0];
            if(tab.url.indexOf('http') === 0) {
                // 使用当前日期作为文件名前缀
                const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
                
                // 先注入必要的依赖
                chrome.tabs.executeScript(tab.id, { file: "js/jquery-3.5.1.min.js" }, function() {
                    chrome.tabs.executeScript(tab.id, { file: "js/jquery.postitall.js" }, function() {
                        // 执行导出逻辑
                        chrome.tabs.executeScript(tab.id, { 
                            code: `
                                if (typeof jQuery !== 'undefined' && typeof jQuery.PostItAll !== 'undefined') { 
                                    // 获取所有便签
                                    jQuery.PostItAll.getNotes(function(notes) {
                                        if(notes != null) {
                                            // 导出到本地文件
                                            var element = document.createElement('a');
                                            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes)));
                                            element.setAttribute('download', '${today}#PIApostit_all.txt');
                                            element.style.display = 'none';
                                            document.body.appendChild(element);
                                            element.click();
                                            document.body.removeChild(element);
                                            
                                            // 发送到后台进行数据库操作
                                            chrome.runtime.sendMessage({
                                                type: 'syncNotes',
                                                notes: notes
                                            });
                                        }
                                    }, "all");
                                } else {
                                    console.log('jQuery 或 PostItAll 未加载');
                                }
                            `
                        }, function() {
                            if(chrome.runtime.lastError) {
                                console.log('导出错误:', chrome.runtime.lastError);
                                return;
                            }
                            console.log('自动导出完成');
                        });
                    });
                });
            }
        });
    } catch (err) {
        console.error("自动导出出错:", err);
    }
}

// 处理数据库同步
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'syncNotes') {
        // 上传到数据库
        createSweetNotes(request.notes)
        .then(() => {
            console.log('便签已上传到数据库');
            return exportRemoteUserNotes();
        })
        .then(remoteNotes => {
            if (remoteNotes && remoteNotes.length > 0) {
                // 发送远程便签回内容脚本进行导入
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if(!tabs[0]) return;
                    
                    chrome.tabs.executeScript(tabs[0].id, {
                        code: `
                            if (typeof $.PostItAll !== 'undefined') {
                                $.PostItAll.import(${JSON.stringify(remoteNotes)}, true, function() {
                                    console.log('远程便签导入成功');
                                    if(typeof lengthPostits === 'function') {
                                        setTimeout(lengthPostits, 1000);
                                    }
                                });
                            }
                        `
                    });
                });
            }
        })
        .catch(err => {
            console.error('同步过程出错:', err);
        });
    }
});

// 启动定时器
let exportInterval;

function startAutoExport() {
    if (!exportInterval) {
        exportInterval = setInterval(autoExportNotes, 5000);
        console.log('启动自动导出');
    }
}

function stopAutoExport() {
    if (exportInterval) {
        clearInterval(exportInterval);
        exportInterval = null;
        console.log('停止自动导出');
    }
}

// 在扩展启动时开始自动导出
chrome.runtime.onStartup.addListener(startAutoExport);
chrome.runtime.onInstalled.addListener(startAutoExport);

// 在扩展停用时停止自动导出
chrome.runtime.onSuspend.addListener(stopAutoExport);

// 开始自动导出
startAutoExport();


