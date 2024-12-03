const fs = require('fs');
const path = require('path');

// 自动导出便签的函数
function autoExportNotes() {
    try {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if(!tabs[0]) return;
            
            const tab = tabs[0];
            
            // 调用 PostItAll 的导出函数获取所有便签
            chrome.tabs.executeScript(tab.id, { 
                code: `
                    var notes = [];
                    $.PostItAll.getNotes(function(allNotes) {
                        notes = allNotes;
                        chrome.runtime.sendMessage({
                            type: 'autoExport',
                            notes: notes
                        });
                    }, "all");
                `
            });
        });
    } catch (err) {
        console.error("自动导出出错:", err);
    }
}

// 处理导出的数据并保存到文件
function saveNotesToFile(notes) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '');
        const fileName = `PIApostit_all_autoExport_${timestamp}.txt`;
        const filePath = path.join(__dirname, 'data', fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf-8');
        console.log(`便签已自动导出到: ${fileName}`);
    } catch (err) {
        console.error("保存文件时出错:", err);
    }
} 