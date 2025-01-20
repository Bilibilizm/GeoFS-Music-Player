// ==UserScript==
// @name         GeoFS Music Player
// @version      1.0
// @match        https://www.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// ==/UserScript==

(function () {
    'use strict';

    // 初始化变量
    let isDarkTheme = true;
    let shortcutKey = 'M';
    let volume = 0.5; 
    let showButton = true; 
    let showBottomBar = true; 
    let playlist = JSON.parse(localStorage.getItem('playlist')) || [];
    let currentSongIndex = 0; 
    let playMode = 'Sequential';
    let currentPage = 1; 
    const itemsPerPage = 8; 

    // 创建播放器容器
    const playerContainer = document.createElement('div');
    playerContainer.style.position = 'fixed';
    playerContainer.style.bottom = '20px';
    playerContainer.style.right = '20px';
    playerContainer.style.backgroundColor = isDarkTheme ? '#181818' : '#fff';
    playerContainer.style.padding = '20px';
    playerContainer.style.borderRadius = '15px';
    playerContainer.style.color = isDarkTheme ? '#fff' : '#000';
    playerContainer.style.zIndex = '1000';
    playerContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    playerContainer.style.width = '400px'; // 宽度调整为400px
    playerContainer.style.height = '400px'; // 高度保持不变
    playerContainer.style.display = 'none'; // 默认隐藏
    playerContainer.style.transition = 'opacity 0.3s ease';

    // 创建标题和副标题
    const title = document.createElement('div');
    title.innerText = 'GeoFS Music Player';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';

    const subtitle = document.createElement('div');
    subtitle.innerText = 'Made by 開飛機のzm';
    subtitle.style.fontSize = '12px';
    subtitle.style.color = isDarkTheme ? '#b3b3b3' : '#666';
    subtitle.style.marginBottom = '15px';

    playerContainer.appendChild(title);
    playerContainer.appendChild(subtitle);

    // 创建音乐按钮
    const musicButton = document.createElement('button');
    musicButton.innerText = '🎵';
    musicButton.style.position = 'fixed';
    musicButton.style.bottom = '20px';
    musicButton.style.right = '20px';
    musicButton.style.backgroundColor = '#1DB954';
    musicButton.style.color = '#fff';
    musicButton.style.border = 'none';
    musicButton.style.borderRadius = '25px';
    musicButton.style.padding = '10px 20px';
    musicButton.style.cursor = 'pointer';
    musicButton.style.zIndex = '1000';
    musicButton.style.fontSize = '16px';
    musicButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
    musicButton.onclick = togglePlayer;

    // 创建底部播放状态栏
    const bottomBar = document.createElement('div');
    bottomBar.style.position = 'fixed';
    bottomBar.style.bottom = '0';
    bottomBar.style.left = '0';
    bottomBar.style.width = '100%';
    bottomBar.style.backgroundColor = isDarkTheme ? '#181818' : '#fff';
    bottomBar.style.color = isDarkTheme ? '#fff' : '#000';
    bottomBar.style.padding = '10px';
    bottomBar.style.textAlign = 'center';
    bottomBar.style.zIndex = '999';
    bottomBar.style.display = showBottomBar ? 'block' : 'none'; // 根据设置显示或隐藏
    bottomBar.innerText = 'Now Playing: None';

    // 创建播放器
    const audioPlayer = document.createElement('audio');
    audioPlayer.style.width = '100%';
    audioPlayer.volume = volume;
    playerContainer.appendChild(audioPlayer);

    // 创建播放控制按钮
    const controls = document.createElement('div');
    controls.style.marginTop = '15px';
    controls.style.display = 'flex';
    controls.style.justifyContent = 'space-between';
    controls.style.alignItems = 'center';

    const prevButton = createButton('⏮', playPrev);
    const playPauseButton = createButton('⏯', togglePlayPause);
    const nextButton = createButton('⏭', playNext);
    const modeButton = createButton('🔀', togglePlayMode); // 播放模式按钮

    controls.appendChild(prevButton);
    controls.appendChild(playPauseButton);
    controls.appendChild(nextButton);
    controls.appendChild(modeButton);

    playerContainer.appendChild(controls);

    // 创建进度条
    const progressContainer = document.createElement('div');
    progressContainer.style.marginTop = '15px';
    progressContainer.style.width = '100%';
    progressContainer.style.height = '5px';
    progressContainer.style.backgroundColor = isDarkTheme ? '#333' : '#ddd';
    progressContainer.style.borderRadius = '5px';
    progressContainer.style.position = 'relative';
    progressContainer.style.cursor = 'pointer';

    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#1DB954';
    progressBar.style.borderRadius = '5px';
    progressBar.style.position = 'absolute';
    progressBar.style.top = '0';
    progressBar.style.left = '0';

    progressContainer.appendChild(progressBar);
    playerContainer.appendChild(progressContainer);

    // 创建时间显示
    const timeDisplay = document.createElement('div');
    timeDisplay.style.marginTop = '10px';
    timeDisplay.style.display = 'flex';
    timeDisplay.style.justifyContent = 'space-between';
    timeDisplay.style.fontSize = '12px';
    timeDisplay.style.color = isDarkTheme ? '#b3b3b3' : '#666';

    const currentTime = document.createElement('span');
    currentTime.innerText = '00:00';
    const totalTime = document.createElement('span');
    totalTime.innerText = '00:00';

    timeDisplay.appendChild(currentTime);
    timeDisplay.appendChild(totalTime);
    playerContainer.appendChild(timeDisplay);

    // 创建歌单容器
    const playlistContainer = document.createElement('div');
    playlistContainer.style.marginTop = '15px';
    playlistContainer.style.maxHeight = '200px';
    playlistContainer.style.overflowY = 'auto';
    playlistContainer.style.borderTop = `1px solid ${isDarkTheme ? '#333' : '#ddd'}`;
    playlistContainer.style.paddingTop = '10px';

    playerContainer.appendChild(playlistContainer);

    // 创建分页按钮
    const paginationContainer = document.createElement('div');
    paginationContainer.style.marginTop = '10px';
    paginationContainer.style.display = 'flex';
    paginationContainer.style.justifyContent = 'center';
    paginationContainer.style.alignItems = 'center';

    const prevPageButton = createButton('◀', () => changePage(-1));
    const nextPageButton = createButton('▶', () => changePage(1));
    const pageInfo = document.createElement('span');
    pageInfo.style.margin = '0 10px';
    pageInfo.style.color = isDarkTheme ? '#b3b3b3' : '#666';

    paginationContainer.appendChild(prevPageButton);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextPageButton);
    playerContainer.appendChild(paginationContainer);

    // 创建导入文件和设置按钮的容器
    const utilityButtonsContainer = document.createElement('div');
    utilityButtonsContainer.style.marginTop = '10px';
    utilityButtonsContainer.style.display = 'flex';
    utilityButtonsContainer.style.justifyContent = 'space-between';

// 导入文件按钮
const importPlaylistButton = createButton('Import Files', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3,.mp4';
    input.multiple = true;
    input.onchange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            Array.from(files).forEach((file) => {
                if (checkFileSize(file)) {
                    const url = URL.createObjectURL(file);
                    playlist.push({ name: file.name, file: url });
                }
            });
            updatePlaylist();
            savePlaylistToLocal(); // 保存到本地存储
        }
    };
    input.click();
});

    // 设置按钮
    const settingsButton = createButton('Settings', toggleSettings);

    utilityButtonsContainer.appendChild(importPlaylistButton);
    utilityButtonsContainer.appendChild(settingsButton);
    playerContainer.appendChild(utilityButtonsContainer);

    // 更新分页显示
    function updatePagination() {
        const totalPages = Math.ceil(playlist.length / itemsPerPage);
        pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    // 切换分页
    function changePage(direction) {
        const totalPages = Math.ceil(playlist.length / itemsPerPage);
        currentPage = Math.max(1, Math.min(totalPages, currentPage + direction));
        updatePlaylist();
        updatePagination();
    }

    // 更新歌单显示
    function updatePlaylist() {
        playlistContainer.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        playlist.slice(startIndex, endIndex).forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.innerText = `${startIndex + index + 1}. ${song.name}`;
            songItem.style.cursor = 'pointer';
            songItem.style.padding = '8px';
            songItem.style.borderBottom = `1px solid ${isDarkTheme ? '#333' : '#ddd'}`;
            songItem.style.transition = 'background 0.2s ease';
            songItem.onclick = () => playSong(startIndex + index);
            songItem.oncontextmenu = (e) => {
                e.preventDefault();
                showSongContextMenu(e, songItem, startIndex + index);
            };
            songItem.draggable = true;
            songItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', startIndex + index);
            });
            songItem.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            songItem.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = e.dataTransfer.getData('text/plain');
                const toIndex = startIndex + index;
                moveSong(fromIndex, toIndex);
            });
            playlistContainer.appendChild(songItem);
        });
        updatePagination();
    }

// 播放歌曲
function playSong(index) {
    currentSongIndex = index;
    const song = playlist[index];
    if (song.file) {
        audioPlayer.src = song.file;
        audioPlayer.play()
            .then(() => {
                playPauseButton.innerText = '⏸';
                bottomBar.innerText = `Now Playing: ${song.name}`;
                bottomBar.style.display = showBottomBar ? 'block' : 'none';
            })
            .catch((error) => {
                alert(`Failed to play the file: ${error.message}`);
                console.error('Playback error:', error);
            });
    }
}

    // 播放控制
    function togglePlayPause() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseButton.innerText = '⏸';
        } else {
            audioPlayer.pause();
            playPauseButton.innerText = '⏯';
        }
    }

    function playPrev() {
        if (playMode === 'Shuffle') {
            currentSongIndex = Math.floor(Math.random() * playlist.length);
        } else {
            currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        }
        playSong(currentSongIndex);
    }

    function playNext() {
        if (playMode === 'Shuffle') {
            currentSongIndex = Math.floor(Math.random() * playlist.length);
        } else {
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
        }
        playSong(currentSongIndex);
    }

    function togglePlayMode() {
        const modes = ['Sequential', 'Shuffle', 'Loop'];
        const currentIndex = modes.indexOf(playMode);
        playMode = modes[(currentIndex + 1) % modes.length];
        modeButton.innerText = playMode === 'Loop' ? '🔂' : '🔀';
        audioPlayer.loop = playMode === 'Loop';
    }

    // 进度条更新
    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progress}%`;
        currentTime.innerText = formatTime(audioPlayer.currentTime);
        totalTime.innerText = formatTime(audioPlayer.duration);
    });

    // 拖动进度条
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = clickPosition * audioPlayer.duration;
    });

    // 格式化时间
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // 自动播放下一首
    audioPlayer.addEventListener('ended', () => {
        if (playMode !== 'Loop') {
            playNext();
        }
    });

    // 拖动功能优化
    let isDragging = false;
    let offsetX, offsetY;

    // 创建拖动点
    const dragHandle = document.createElement('div');
    dragHandle.style.position = 'absolute';
    dragHandle.style.bottom = '5px';
    dragHandle.style.right = '5px';
    dragHandle.style.width = '10px';
    dragHandle.style.height = '10px';
    dragHandle.style.backgroundColor = isDarkTheme ? '#b3b3b3' : '#666';
    dragHandle.style.borderRadius = '50%';
    dragHandle.style.cursor = 'move';
    dragHandle.style.zIndex = '1001';
    playerContainer.appendChild(dragHandle);

    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - playerContainer.getBoundingClientRect().left;
        offsetY = e.clientY - playerContainer.getBoundingClientRect().top;
        playerContainer.style.opacity = '0.8';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            playerContainer.style.left = `${Math.max(0, Math.min(window.innerWidth - playerContainer.offsetWidth, x))}px`;
            playerContainer.style.top = `${Math.max(0, Math.min(window.innerHeight - playerContainer.offsetHeight, y))}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        playerContainer.style.opacity = '1';
    });

    // 打开/关闭设置界面
    function toggleSettings() {
        const settingsContainer = document.querySelector('.settings-container');
        if (settingsContainer) {
            settingsContainer.remove();
            playlistContainer.style.display = 'block'; // 恢复歌单显示
        } else {
            openSettings();
        }
    }

    // 打开设置界面
    function openSettings() {
        // 隐藏歌单界面
        playlistContainer.style.display = 'none';

        // 创建设置界面
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-container';
        settingsContainer.style.marginTop = '15px';

        // 主题切换
        const themeButton = createButton(`Toggle Theme (Current: ${isDarkTheme ? 'Dark' : 'Light'})`, () => {
            isDarkTheme = !isDarkTheme;
            updateTheme();
            themeButton.innerText = `Toggle Theme (Current: ${isDarkTheme ? 'Dark' : 'Light'})`;
        });

        // 快捷键修改
        const shortcutButton = createButton(`Change Shortcut (Current: ${shortcutKey})`, () => {
            shortcutKey = prompt('Enter new shortcut key (e.g., M):');
            updateShortcut();
            shortcutButton.innerText = `Change Shortcut (Current: ${shortcutKey})`;
        });

        // 是否显示点击式按钮
        const showButtonToggle = createButton(`Show Button (Current: ${showButton ? 'Yes' : 'No'})`, () => {
            showButton = !showButton;
            musicButton.style.display = showButton ? 'block' : 'none';
            showButtonToggle.innerText = `Show Button (Current: ${showButton ? 'Yes' : 'No'})`;
        });

        // 是否显示底部播放状态栏
        const showBottomBarToggle = createButton(`Show Bottom Bar (Current: ${showBottomBar ? 'Yes' : 'No'})`, () => {
            showBottomBar = !showBottomBar;
            bottomBar.style.display = showBottomBar ? 'block' : 'none';
            showBottomBarToggle.innerText = `Show Bottom Bar (Current: ${showBottomBar ? 'Yes' : 'No'})`;
        });

        // 导出歌单
        const exportButton = createButton('Export Playlist', () => {
            const blob = new Blob([JSON.stringify(playlist)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'playlist.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        // 导入歌单
        const importPlaylistButton = createButton('Import Playlist', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const importedPlaylist = JSON.parse(event.target.result);
                            if (Array.isArray(importedPlaylist)) {
                                playlist = importedPlaylist;
                                updatePlaylist();
                                savePlaylistToLocal();
                                alert('Playlist imported successfully!');
                            } else {
                                alert('Invalid playlist format. Please ensure the file is a valid JSON array.');
                            }
                        } catch (error) {
                            alert('Failed to parse the playlist file. Please check the file format.');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        });

        // 将按钮添加到设置界面
        settingsContainer.appendChild(themeButton);
        settingsContainer.appendChild(shortcutButton);
        settingsContainer.appendChild(showButtonToggle);
        settingsContainer.appendChild(showBottomBarToggle);
        settingsContainer.appendChild(exportButton);
        settingsContainer.appendChild(importPlaylistButton);

        // 将设置界面添加到播放器容器
        playerContainer.appendChild(settingsContainer);
    }

// 更新主题
function updateTheme() {
    // 更新播放器容器的背景色和文字颜色
    playerContainer.style.backgroundColor = isDarkTheme ? '#181818' : '#fff';
    playerContainer.style.color = isDarkTheme ? '#fff' : '#000';

    // 更新底部播放状态栏的背景色和文字颜色
    bottomBar.style.backgroundColor = isDarkTheme ? '#181818' : '#fff';
    bottomBar.style.color = isDarkTheme ? '#fff' : '#000';

    // 更新进度条和拖动点的颜色
    progressContainer.style.backgroundColor = isDarkTheme ? '#333' : '#ddd';
    dragHandle.style.backgroundColor = isDarkTheme ? '#b3b3b3' : '#666';

    // 更新时间显示的颜色
    timeDisplay.style.color = isDarkTheme ? '#b3b3b3' : '#666';

    // 更新歌单容器的边框颜色
    playlistContainer.style.borderTop = `1px solid ${isDarkTheme ? '#333' : '#ddd'}`;

    // 更新所有插件内部按钮的样式
    const pluginButtons = playerContainer.querySelectorAll('button');
    pluginButtons.forEach(button => {
        if (button !== musicButton) { // 排除点击式按钮
            button.style.backgroundColor = isDarkTheme ? '#333' : '#f0f0f0';
            button.style.color = isDarkTheme ? '#b3b3b3' : '#333';
            button.onmouseleave = () => (button.style.backgroundColor = isDarkTheme ? '#333' : '#f0f0f0');
        }
    });
}

    // 更新快捷键
    function updateShortcut() {
        document.removeEventListener('keydown', handleShortcut);
        document.addEventListener('keydown', handleShortcut);
    }

    // 快捷键处理
    function handleShortcut(e) {
        if (e.key.toUpperCase() === shortcutKey.toUpperCase()) {
            togglePlayer();
        }
    }

    // 切换播放器显示
    function togglePlayer() {
        playerContainer.style.display = playerContainer.style.display === 'none' ? 'block' : 'none';
        bottomBar.style.display = playerContainer.style.display === 'none' ? 'block' : 'none';
    }

    // 创建按钮的辅助函数
    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.innerText = text;
        button.style.backgroundColor = isDarkTheme ? '#333' : '#f0f0f0'; // 浅色主题按钮背景色
        button.style.color = isDarkTheme ? '#b3b3b3' : '#333'; // 浅色主题按钮文字颜色
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.padding = '8px 12px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background 0.2s ease';
        button.onclick = onClick;
        button.onmouseenter = () => (button.style.backgroundColor = '#1DB954');
        button.onmouseleave = () => (button.style.backgroundColor = isDarkTheme ? '#333' : '#f0f0f0');
        return button;
    }

    // 保存歌单到本地存储
    function savePlaylistToLocal() {
        localStorage.setItem('playlist', JSON.stringify(playlist));
    }

    // 显示右键菜单
    function showSongContextMenu(e, songItem, index) {
        const contextMenu = document.createElement('div');
        contextMenu.style.position = 'absolute';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.style.backgroundColor = isDarkTheme ? '#333' : '#f0f0f0';
        contextMenu.style.color = isDarkTheme ? '#fff' : '#333';
        contextMenu.style.borderRadius = '5px';
        contextMenu.style.padding = '8px';
        contextMenu.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
        contextMenu.style.zIndex = '1001';

        const renameOption = document.createElement('div');
        renameOption.innerText = 'Rename';
        renameOption.style.cursor = 'pointer';
        renameOption.style.padding = '4px';
        renameOption.onclick = () => {
            const newName = prompt('Enter new name:', playlist[index].name);
            if (newName) {
                playlist[index].name = newName;
                updatePlaylist();
                savePlaylistToLocal();
            }
            contextMenu.remove();
        };

        const deleteOption = document.createElement('div');
        deleteOption.innerText = 'Delete';
        deleteOption.style.cursor = 'pointer';
        deleteOption.style.padding = '4px';
        deleteOption.onclick = () => {
            playlist.splice(index, 1);
            updatePlaylist();
            savePlaylistToLocal();
            contextMenu.remove();
        };

        contextMenu.appendChild(renameOption);
        contextMenu.appendChild(deleteOption);
        document.body.appendChild(contextMenu);

        // 点击其他地方关闭右键菜单
        document.addEventListener('click', () => contextMenu.remove(), { once: true });
    }

    // 移动歌曲位置
    function moveSong(fromIndex, toIndex) {
        const song = playlist.splice(fromIndex, 1)[0];
        playlist.splice(toIndex, 0, song);
        updatePlaylist();
        savePlaylistToLocal();
    }

    // 文件大小限制
    function checkFileSize(file) {
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            alert('File size exceeds 20MB. Please choose a smaller file.');
            return false;
        }
        return true;
    }

    // 添加到页面
    document.body.appendChild(musicButton);
    document.body.appendChild(playerContainer);
    document.body.appendChild(bottomBar);

    // 初始化
    updatePlaylist();
    updateShortcut();
    updateTheme();
})();
