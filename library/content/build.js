// ================================================
// CS Dojo — LIBRARY / content build
// ------------------------------------------------
// Loads AFTER every course file and publishes the globals the branches
// read. This is the only file that creates them, and it creates them
// from whatever registered itself — so a course is added or removed by
// changing script tags, never by editing this.
// ================================================

const CONTENT = Content.build();

const MODULES     = CONTENT.MODULES;
const UNITS       = CONTENT.UNITS;
const COURSES     = CONTENT.COURSES;
const ALL_TOPICS  = CONTENT.ALL_TOPICS;
const UNIT_TOPICS = CONTENT.UNIT_TOPICS;
