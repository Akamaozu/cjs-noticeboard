---
CHANGELOG
===
---

Version Notes are summaries of what changed and how safe it is to upgrade from the directly previous version. Please scan over them. 
-
I dont expect everyone *(and by that I mean anyone)* wants to read over the Notes so I'm introducing the Overall Upgrade Safety rating system.

---
Overall Upgrade Safety is a 5 Point Rating System to indicate how safe the upgrade is from the preceeding version. Here's how you should interpret it.
-
**5/5**: **Fort Knox**. U.S Treasury Safe.

**4/5**: **Safe** unless you're using Dangerous APIs *(prefixed with underscore)* or accessing properties outside the conventional way.

**3/5**: **Minor Changes** made to non-dangerous APIs. Look over the version notes to check what changed. 

**2/5**: **Major Changes** made. There's an upgrade path but it requires you treading with caution. Make no assumption of previous behavior on any updated APIs.

**1/5**: **VERY RISKY!** So many changes I can't even guarantee APIs that shouldn't be affected are safe. I wouldn't even recommend you upgrade unless you know what you are doing, what I am doing and what the meaning of life is. 

---
V. 0.0.4
===
---
OVERALL UPGRADE SAFETY: 3/5
---
1. **`Noticeboard.watch` throws error on attempted overwrite of existing watcher**

**NOTES**
-
- **`Noticeboard.watch` throws error on attempted overwrite of existing watcher**
	- Previously used to return false on attempted watcher overwrite, it now throws an `Error` to prevent silent fails or the need to check the return value of each use of `Noticeboard.watch`.  

---
V. 0.0.3
===
---
OVERALL UPGRADE SAFETY: 3/5
---
1. **BUGFIX: `Noticeboard.watch` allows overwriting an existing watcher**
2. **BUGFIX: `Noticeboard.once` ignores notice before triggering callback**
3. **Added `Noticeboard.watch` option: `once`**
4. **Rewrote Tests**

**NOTES**
-
- **BUGFIX: `Noticeboard.watch` allows overwriting an existing watcher**
	- While technically not a bug in the sense that it was unintended behavior, (was used extensively in the 0.0.2 tests) but the behavior leads to unpredictable behavior of applications and made them harder to debug.
	- It's very tricky to debug your app when watchers are overwriting each other or forcing others to ignore the notice they just subscribed to. Very buggy, if you ask me.    
- **BUGFIX: `Noticeboard.once` ignores notice before triggering callback**
	- The last implementation triggered `ignore` before firing the callback.
	- Coupled with the overwriting bug from `Noticeboard.watch`, using `Noticeboard.once` multiple times with the same watcher name would result in callbacks going missing and you getting an unhelpful ERROR log message. Nobody cares what the error is as long as they are using the library!
	- `Noticeboard.once` is now a thin wrapper around `Noticeboard.watch`, as it should be. All it does is set option `once: true` for your `Noticeboard.watch` function. 
- **Added `Noticeboard.watch` option: `once`**
	- `Noticeboard.watch(notice, watcher, callback, {once: true})` === `Noticeboard.once(notice, watcher, callback)`
- **Rewrote Tests**
	- The previous tests relied on buggy behavior so it needed to be completely rewritten.
	- Also needed to add coverage for the fixed bugs to prevent regression.    

---
V. 0.0.2
===
---
OVERALL UPGRADE SAFETY: 4/5
---
1. **Added Mocha Tests**
2. **Changed Internal Variable Names**

**NOTES**
-
- **Added Mocha Tests**
	- To test, just run **mocha**.
	- Test Coverage: All Public APIs and their expected behavior. Even the unsafe one. 
	- Hint: `_notifyWatcher` is the unsafe one.
- **Changed Internal Variable Names**
	- Shouldn't affect anything EXCEPT you were using `_notifyWatcher` or if you were accessing watcher messages outside the callback. 
	- The naming convention is changed from `watcherParams` to `watcherMessage`. Likewise from `noticeParams` to `noticeMessage`. It's more consistent and likely to remain this way for the foreseeable future. Still not safe to use them.