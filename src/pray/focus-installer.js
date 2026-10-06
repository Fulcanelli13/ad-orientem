import "./focus-styles.js";
import { installPrayFocusRuntime } from "./focus-runtime.js";
if(typeof window!=="undefined"&&typeof document!=="undefined")installPrayFocusRuntime();
