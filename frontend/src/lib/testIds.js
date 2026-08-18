export const TID = {
    // home
    homeScreen: "home-screen",
    homeHeroTitle: "home-hero-title",
    weekPickerPrev: "week-prev-btn",
    weekPickerNext: "week-next-btn",
    weekPickerLabel: "week-current-label",
    phaseBadge: "phase-badge",
    startSessionBtn: (id) => `start-session-${id}-btn`,
    sessionCard: (id) => `session-card-${id}`,
    sessionCardToggle: (id) => `session-card-toggle-${id}`,
    sessionCardList: (id) => `session-card-list-${id}`,
    sessionCardStart: (id) => `session-card-start-${id}`,
    weekCalendar: "week-calendar",
    logsLink: "logs-link",

    // player
    playerRoot: "player-root",
    playerBlockTitle: "player-block-title",
    playerTimerDigits: "player-timer-digits",
    playerNextBtn: "player-next-btn",
    playerPrevBtn: "player-prev-btn",
    playerPlayPauseBtn: "player-play-pause-btn",
    playerAdd30sBtn: "player-add-30s-btn",
    playerMuteBtn: "player-mute-btn",
    playerExitBtn: "player-exit-btn",
    playerProgress: "player-progress",
    playerMarkSetBtn: "player-mark-set-btn",
    playerSetCount: "player-set-count",

    // logs
    logsScreen: "logs-screen",
    logsExerciseSelect: "logs-exercise-select",
    logsWeightInput: "logs-weight-input",
    logsRepsInput: "logs-reps-input",
    logsTopRangeCheckbox: "logs-toprange-checkbox",
    logsSubmitBtn: "logs-submit-btn",
    logsList: "logs-list",
    logsSuggestion: "logs-suggestion",

    // videos
    videosScreen: "videos-screen",
    videosLink: "videos-link",
    videoRow: (name) => `video-row-${name.toLowerCase().replace(/\s+/g, "-")}`,
    videoUploadInput: (name) => `video-upload-input-${name.toLowerCase().replace(/\s+/g, "-")}`,
    videoDeleteBtn: (name) => `video-delete-btn-${name.toLowerCase().replace(/\s+/g, "-")}`,
    videoPreview: (name) => `video-preview-${name.toLowerCase().replace(/\s+/g, "-")}`,
    videoYoutubeBtn: (name) => `video-yt-btn-${name.toLowerCase().replace(/\s+/g, "-")}`,
    videoYoutubeInput: (name) => `video-yt-input-${name.toLowerCase().replace(/\s+/g, "-")}`,
    videoYoutubeSubmit: (name) => `video-yt-submit-${name.toLowerCase().replace(/\s+/g, "-")}`,

    // match-day checklist
    checklistItem: (i) => `checklist-item-${i}`,
    checklistDone: "checklist-done-btn",
};
