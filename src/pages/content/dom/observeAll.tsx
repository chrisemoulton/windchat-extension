import { throttle } from 'lodash';
import { isGroupActive } from './isGroupActive';
import { hasClass } from '../utils';
import { appendPreviewBlocks } from './appendPreviewBlocks';
import { appendSwitch } from './appendSwitch';
import { previewBlockAddedClass } from './codeBlockConfig';
import { removeAvatar } from './removeAvatar';
import { removeThumbs } from './removeThumbs';
import { setChatBlockStyle } from './setChatBlockStyle';
import { setContainerFlex } from './setContainerFlex';
import { appendPreviewBlocksLast } from './appendPreviewBlocksLast';

export function observeAll() {
  const observer = new MutationObserver(async (mutationsList, observer) => {
    mutationsList.forEach(async (mutation) => {
      const target = mutation.target as HTMLElement;
      const type = mutation.type;
      const tagName = target.tagName;

      // console.log('target', target);
      // console.log('target.classList', target.classList);
      // console.log('tagName', tagName);

      // @ts-ignore
      if (hasClass(target, 'hljs') ||
        hasClass(target, 'xml') ||
        hasClass(target, 'hljs-tag')) {
        lastChatHandler();
      }

      if (hasClass(target, 'h-full flex justify-center')) {
        appendSwitch();
      }

      if (hasClass(target, 'flex-col flex-1 overflow-y-auto')) {
        sidebarHandler();
      }

      if (hasClass(target, 'flex flex-col text-sm')) {
        groupsHandler();
      }

      if (tagName === 'MAIN' && hasClass(target, 'relative h-full w-full transition-width overflow-auto flex-1')) {
        groupsHandler();
        appendSwitch();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  new ResizeObserver(() => {
    appendSwitch();
  }).observe(document.body)
}


export async function sidebarHandler() {
  const active = await isGroupActive();

  if (active) {
    // 切换时，如果 active，监听 groups 变化
    applyChatGroupsChanges()
  }
}

export const groupsHandler = throttle(() => groupsHandler0(), 200, { trailing: true, leading: true });
export async function groupsHandler0() {
  const active = await isGroupActive();
  if (!active) return;
  applyChatGroupsChanges()
  return
}

export const lastChatHandler = throttle(() => lastChatHandler0(), 200, { trailing: true, leading: true })
function lastChatHandler0() {
  removeAvatar();
  removeThumbs();

  setChatBlockStyle();
  appendPreviewBlocksLast()
}

export function checkPreviewBlockInited() {
  const found = document.querySelector(`.${previewBlockAddedClass}`)
  return !!found
}

export function applyChatGroupsChanges() {
  const loaded = checkPreviewBlockInited()
  if (!loaded) {
    removeAvatar();
    removeThumbs();
    setContainerFlex();
    setChatBlockStyle();
    appendPreviewBlocks()
  }
}
