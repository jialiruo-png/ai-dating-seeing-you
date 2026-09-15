import { toPng } from 'html-to-image';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  Download,
  Heart,
  ImageDown,
  MapPin,
  Share2,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import fireworksImage from '../assets/icons/card-fireworks.png';
import calendarImage from '../assets/icons/date-calendar.png';
import dinnerImage from '../assets/icons/date-dinner-table.png';
import coffeeImage from '../assets/icons/food-coffee.png';
import envelopeImage from '../assets/icons/open-envelope.png';
import clockImage from '../assets/icons/time-clock.png';
import sceneImage from '../assets/scenes/meteor-hearts.png';

type InviteState = {
  step: number;
  date: string;
  primaryTimes: string[];
  backupTimes: string[];
  dateStyle: string;
  foods: string[];
};

const STORAGE_KEY = 'the-thought-of-seeing-you-v04';
const initialState: InviteState = {
  step: 0,
  date: '',
  primaryTimes: [],
  backupTimes: [],
  dateStyle: '',
  foods: [],
};

const primaryTimes = [
  '上午 10 点',
  '午后 2 点',
  '下午 4 点',
  '傍晚 6 点',
  '晚饭后 8 点',
  '夜晚 9 点',
];
const backupTimes = [
  ['今天晚上', '月亮升起以后'],
  ['明天', '把期待留到明天'],
  ['这个周末', '不用赶时间'],
  ['下个周末', '提前把空闲留好'],
  ['工作日晚上', '忙完就来见面'],
  ['午后', '阳光刚好温柔'],
  ['傍晚', '一起看天色变软'],
  ['晚饭后', '适合散步聊天'],
  ['夜一点也行', '晚风会替我等你'],
  ['早午餐时间', '从一杯咖啡开始'],
  ['临时约也可以', '心动不用预约'],
  ['你来定', '我把决定权交给你'],
];
const dateStyles = [
  ['轻松散步', '边走边把最近的故事讲完'],
  ['吃点喜欢的', '认真挑一家让你开心的店'],
  ['看一场电影', '和你共享两个小时的心情'],
  ['找家店慢慢聊天', '让时间安静地流过去'],
  ['一起逛逛', '没有目的地也没关系'],
  ['交给你安排', '跟着你的灵感出发'],
];
const foods = [
  '日料',
  '烧肉',
  '粤菜',
  '火锅',
  '西餐',
  '甜品',
  '咖啡',
  '夜宵',
  '早午餐',
  '小酒馆',
  '街边小吃',
  '惊喜安排',
];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(value: string) {
  if (!value) return '等待你选一个日子';
  const date = new Date(`${value}T12:00:00`);
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 · ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]}`;
}

function toggle(list: string[], value: string) {
  return list.includes(value)
    ? list.filter(item => item !== value)
    : [...list, value];
}

export default function Page() {
  const [state, setState] = useState<InviteState>(initialState);
  const [notice, setNotice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [noPosition, setNoPosition] = useState<{ left: number; top: number } | null>(
    null,
  );
  const [noAttempts, setNoAttempts] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const runawayAreaRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const dates = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index + 1);
        return date;
      }),
    [],
  );

  useEffect(() => {
    document.title = '关于见你这件事 | The Thought of Seeing You';
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const restored = JSON.parse(cached) as Partial<InviteState>;
        setState(current => ({ ...current, ...restored, step: 0 }));
      }
    } catch (error) {
      console.warn('无法恢复本地进度', error);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (storageReady) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, storageReady]);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.step]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const update = (patch: Partial<InviteState>) =>
    setState(current => ({ ...current, ...patch }));
  const next = () => update({ step: Math.min(5, state.step + 1) });
  const back = () => update({ step: Math.max(0, state.step - 1) });

  const moveNoButton = () => {
    const area = runawayAreaRef.current;
    const button = noButtonRef.current;
    if (!area || !button) return;

    const areaRect = area.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const padding = 8;
    const maxLeft = Math.max(padding, areaRect.width - buttonRect.width - padding);
    const maxTop = Math.max(padding, areaRect.height - buttonRect.height - padding);

    let left = padding;
    let top = padding;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidateLeft =
        padding + Math.random() * Math.max(1, maxLeft - padding);
      const candidateTop = padding + Math.random() * Math.max(1, maxTop - padding);
      left = candidateLeft;
      top = candidateTop;
      if (
        !noPosition ||
        Math.hypot(candidateLeft - noPosition.left, candidateTop - noPosition.top) >=
          72
      ) {
        break;
      }
    }

    setNoPosition({ left, top });
    setNoAttempts(attempts => attempts + 1);
  };

  const noButtonCopy =
    noAttempts === 0
      ? '不要 no no no'
      : ['点不到吧', '再想想嘛', '这边也不行', '选愿意吧'][
          Math.min(noAttempts - 1, 3)
        ];

  const valid =
    state.step === 1
      ? Boolean(state.date && state.primaryTimes.length)
      : state.step === 2
        ? state.backupTimes.length > 0
        : state.step === 3
          ? Boolean(state.dateStyle)
          : state.step === 4
            ? state.foods.length > 0
            : true;

  const generateCard = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    setNotice('正在把期待装进卡片里…');
    try {
      await document.fonts?.ready;
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#f9dde4',
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Dating-Card-${state.date}.png`, {
        type: 'image/png',
      });
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setImageFile(file);
      setImageUrl(URL.createObjectURL(blob));
      setNotice('卡片生成好了，愿这份期待很快抵达。');
      return file;
    } catch (error) {
      console.error(error);
      setNotice('刚才的光影走神了，请再生成一次。你的选择都还在。');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const downloadCard = async () => {
    const file = imageFile ?? (await generateCard());
    if (!file) return;
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('已开始下载。手机端也可以长按预览图保存到相册。');
  };

  const shareCard = async () => {
    const file = imageFile ?? (await generateCard());
    if (!file) return;
    try {
      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: '关于见你这件事',
          text: '这是我们的小小约会约定。',
          files: [file],
        });
        setNotice('已经交给系统分享啦。');
      } else {
        await downloadCard();
        setNotice('当前浏览器暂不支持图片分享，已自动为你保存。');
      }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') {
        await downloadCard();
        setNotice('分享没有打开，已自动改为保存图片。');
      }
    }
  };

  const dateValue = state.date ? new Date(`${state.date}T12:00:00`) : null;
  const countdown = dateValue
    ? Math.max(0, Math.ceil((dateValue.getTime() - Date.now()) / 86400000))
    : 0;

  const progress = state.step === 0 ? 0 : Math.round((state.step / 5) * 100);

  return (
    <main className="romance-shell">
      <div className="ambient" aria-hidden="true">
        <span className="glow glow-one" />
        <span className="glow glow-two" />
        <span className="float-mark mark-one">✦</span>
        <span className="float-mark mark-two">♡</span>
        <span className="float-mark mark-three">✧</span>
      </div>

      <section
        className={`letter-panel ${state.step === 0 ? 'opening-panel' : ''}`}
      >
        {state.step > 0 && (
          <header className="topbar">
            <button
              className="icon-button"
              type="button"
              onClick={back}
              aria-label="返回上一步"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="brand-mini">
              <Heart size={15} fill="currentColor" />
              <span>关于见你这件事</span>
            </div>
            <span className="step-count">{state.step}/5</span>
          </header>
        )}
        {state.step > 0 && (
          <div className="progress-track" aria-label={`流程进度 ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        )}

        <div
          className={`page-content ${state.step === 5 ? 'final-content' : ''}`}
          key={state.step}
        >
          {state.step === 0 && (
            <div className="opening-content">
              <p className="eyebrow">一封只给你的邀请</p>
              <img
                className="hero-icon"
                src={envelopeImage}
                alt="系着蝴蝶结的粉色信封"
              />
              <p className="brand-en">THE THOUGHT OF SEEING YOU</p>
              <h1 ref={titleRef} tabIndex={-1}>
                关于见你这件事
              </h1>
              <p className="lead">
                不用现在就回答所有问题，
                <br />
                跟着感觉慢慢选就好。
              </p>
              <div className="runaway-choice-area" ref={runawayAreaRef}>
                <button
                  className="primary-button opening-button yes-button"
                  type="button"
                  onClick={next}
                >
                  愿意 <Heart size={18} fill="currentColor" />
                </button>
                <button
                  ref={noButtonRef}
                  className={`no-button ${noPosition ? 'is-running' : ''}`}
                  style={
                    noPosition
                      ? { left: noPosition.left, top: noPosition.top }
                      : undefined
                  }
                  type="button"
                  tabIndex={-1}
                  aria-label="不要——这个按钮会俏皮地躲开"
                  onMouseEnter={moveNoButton}
                  onMouseDown={event => {
                    event.preventDefault();
                    moveNoButton();
                  }}
                  onTouchStart={event => {
                    event.preventDefault();
                    moveNoButton();
                  }}
                  onFocus={event => event.currentTarget.blur()}
                  onClick={event => {
                    event.preventDefault();
                    moveNoButton();
                  }}
                >
                  {noButtonCopy}
                </button>
              </div>
              {noAttempts > 0 && (
                <p className="runaway-hint" aria-live="polite">
                  看来它不太想被点到，试试“愿意”吧 ♡
                </p>
              )}
            </div>
          )}

          {state.step === 1 && (
            <div>
              <div className="section-heading">
                <img src={calendarImage} alt="粉色日历" />
                <div>
                  <p className="eyebrow">第一封信 · DATE</p>
                  <h1 ref={titleRef} tabIndex={-1}>
                    哪一天，想把时间留给彼此？
                  </h1>
                </div>
              </div>
              <p className="soft-copy">这一天如果刚好有空，我想把它留给你。</p>
              <div className="date-strip" aria-label="选择见面日期">
                {dates.map((date, index) => {
                  const key = dateKey(date);
                  const selected = state.date === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      aria-pressed={selected}
                      className={`date-card ${selected ? 'selected' : ''}`}
                      onClick={() => update({ date: key })}
                    >
                      <span>
                        {index === 0
                          ? '明天'
                          : [
                              '周日',
                              '周一',
                              '周二',
                              '周三',
                              '周四',
                              '周五',
                              '周六',
                            ][date.getDay()]}
                      </span>
                      <strong>{date.getDate()}</strong>
                      <small>{date.getMonth() + 1} 月</small>
                      {selected && (
                        <i>
                          <Check size={12} />
                        </i>
                      )}
                    </button>
                  );
                })}
              </div>
              <h2 className="question-title">
                <Clock3 size={18} /> 什么时候见面最舒服？
              </h2>
              <div className="option-grid primary-time-grid">
                {primaryTimes.map(item => {
                  const selected = state.primaryTimes.includes(item);
                  return (
                    <button
                      type="button"
                      aria-pressed={selected}
                      className={`choice-card compact ${selected ? 'selected' : ''}`}
                      key={item}
                      onClick={() =>
                        update({
                          primaryTimes: toggle(state.primaryTimes, item),
                        })
                      }
                    >
                      <span>{item}</span>
                      <i>
                        {selected ? <Check size={14} /> : <Heart size={14} />}
                      </i>
                    </button>
                  );
                })}
              </div>
              <Summary
                icon={<Sparkles size={15} />}
                text={
                  state.primaryTimes.length
                    ? `${formatDate(state.date)}，${state.primaryTimes.join('、')}，我都期待见到你。`
                    : '选中的时刻，会被好好记在这里。'
                }
              />
            </div>
          )}

          {state.step === 2 && (
            <div>
              <div className="section-heading">
                <img src={clockImage} alt="爱心指针闹钟" />
                <div>
                  <p className="eyebrow">第二封信 · MOMENTS</p>
                  <h1 ref={titleRef} tabIndex={-1}>
                    还有哪些时候，也适合见你？
                  </h1>
                </div>
              </div>
              <p className="soft-copy">
                如果那天不巧，这些时候我也愿意为你留出来。
              </p>
              <div className="option-grid backup-grid">
                {backupTimes.map(([title, subtitle]) => {
                  const selected = state.backupTimes.includes(title);
                  return (
                    <button
                      type="button"
                      aria-pressed={selected}
                      className={`choice-card time-choice ${selected ? 'selected' : ''}`}
                      key={title}
                      onClick={() =>
                        update({
                          backupTimes: toggle(state.backupTimes, title),
                        })
                      }
                    >
                      <Clock3 size={17} />
                      <span>
                        <strong>{title}</strong>
                        <small>{subtitle}</small>
                      </span>
                      <i>{selected ? <Check size={13} /> : null}</i>
                    </button>
                  );
                })}
              </div>
              <Summary
                icon={<CalendarDays size={15} />}
                text={`${formatDate(state.date)} · ${state.primaryTimes.join('、')}`}
              />
            </div>
          )}

          {state.step === 3 && (
            <div>
              <div className="section-heading">
                <img src={dinnerImage} alt="浪漫双人餐桌" />
                <div>
                  <p className="eyebrow">第三封信 · TOGETHER</p>
                  <h1 ref={titleRef} tabIndex={-1}>
                    想怎样度过这次见面？
                  </h1>
                </div>
              </div>
              <p className="soft-copy">散步也好，吃饭也好，重点是和你一起。</p>
              <div className="method-list" aria-label="选择约会方式">
                {dateStyles.map(([title, subtitle], index) => {
                  const selected = state.dateStyle === title;
                  const icons = [
                    MapPin,
                    Utensils,
                    Heart,
                    Coffee,
                    Sparkles,
                    ChevronRight,
                  ];
                  const Icon = icons[index];
                  return (
                    <button
                      type="button"
                      aria-pressed={selected}
                      className={`method-card ${selected ? 'selected' : ''}`}
                      key={title}
                      onClick={() => update({ dateStyle: title })}
                    >
                      <span className="method-icon">
                        <Icon size={20} />
                      </span>
                      <span>
                        <strong>{title}</strong>
                        <small>{subtitle}</small>
                      </span>
                      <i>{selected && <Check size={15} />}</i>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {state.step === 4 && (
            <div>
              <div className="section-heading">
                <img src={coffeeImage} alt="粉色爱心咖啡" />
                <div>
                  <p className="eyebrow">第四封信 · TASTE</p>
                  <h1 ref={titleRef} tabIndex={-1}>
                    见面的时候，想吃点什么？
                  </h1>
                </div>
              </div>
              <p className="soft-copy">
                喜欢的味道都记下来，选店这件事交给期待。
              </p>
              <div className="food-grid">
                {foods.map((food, index) => {
                  const selected = state.foods.includes(food);
                  return (
                    <button
                      type="button"
                      aria-pressed={selected}
                      className={`food-card ${selected ? 'selected' : ''}`}
                      key={food}
                      onClick={() =>
                        update({ foods: toggle(state.foods, food) })
                      }
                    >
                      <span className="food-symbol">
                        {
                          [
                            '桜',
                            '炙',
                            '粤',
                            '沸',
                            '餐',
                            '甜',
                            '珈',
                            '夜',
                            '昼',
                            '酌',
                            '巷',
                            '♡',
                          ][index]
                        }
                      </span>
                      <strong>{food}</strong>
                      <i>{selected && <Check size={13} />}</i>
                    </button>
                  );
                })}
              </div>
              <Summary
                icon={<Utensils size={15} />}
                text={
                  state.foods.length
                    ? `想尝尝：${state.foods.join('、')}`
                    : '把此刻想吃的，都轻轻勾起来。'
                }
              />
            </div>
          )}

          {state.step === 5 && (
            <div className="final-page">
              <div className="final-heading">
                <img src={fireworksImage} alt="爱心烟花" />
                <p className="eyebrow">INVITATION ACCEPTED</p>
                <h1 ref={titleRef} tabIndex={-1}>
                  真开心，你收下了这份邀请。
                </h1>
                <p>我会带着期待，准时来见你。</p>
              </div>
              <div className="preview-frame">
                <div className="dating-card" ref={cardRef}>
                  <img className="scene" src={sceneImage} alt="" />
                  <div className="card-overlay" />
                  <div className="card-top">
                    <span>THE THOUGHT OF SEEING YOU</span>
                    <Heart size={22} fill="currentColor" />
                  </div>
                  <div className="card-title">
                    <small>DATING CARD · 约会小约定</small>
                    <h2>
                      关于见你
                      <br />
                      这件事
                    </h2>
                    <p>「被认真期待的见面，值得好好收藏。」</p>
                  </div>
                  <div className="card-details">
                    <CardRow
                      label="DATE / 日期"
                      value={formatDate(state.date)}
                    />
                    <CardRow
                      label="TIME / 期待时刻"
                      value={state.primaryTimes.join(' · ')}
                    />
                    <CardRow label="PLAN / 约会方式" value={state.dateStyle} />
                    <CardRow
                      label="TASTE / 想吃的"
                      value={state.foods.join(' · ')}
                    />
                    <CardRow
                      label="ALSO / 备选时间"
                      value={state.backupTimes.join(' · ')}
                    />
                  </div>
                  <div className="card-footer">
                    <span>我会带着期待，准时来见你。</span>
                    <small>— 期待见你的我</small>
                  </div>
                </div>
                {imageUrl && (
                  <img
                    className="generated-card-image"
                    src={imageUrl}
                    alt="生成的 Dating 卡片，可长按保存"
                  />
                )}
              </div>
              <div className="countdown">
                <Sparkles size={18} />
                <span>
                  {countdown > 0
                    ? `距离见到你，大约还有 ${countdown} 天。`
                    : '见面的日子已经很近了。'}
                </span>
              </div>
              <div className="final-actions">
                <button
                  className="primary-button"
                  type="button"
                  disabled={generating}
                  onClick={generateCard}
                >
                  <ImageDown size={18} />
                  {generating ? '正在生成…' : '生成 Dating 卡片'}
                </button>
                <div className="secondary-actions">
                  <button type="button" onClick={downloadCard}>
                    <Download size={17} />
                    保存图片
                  </button>
                  <button type="button" onClick={shareCard}>
                    <Share2 size={17} />
                    分享
                  </button>
                </div>
              </div>
              <p className="save-tip">
                手机端如未直接写入相册，可长按生成后的图片保存，或使用浏览器下载。
              </p>
            </div>
          )}
        </div>

        {state.step > 0 && state.step < 5 && (
          <footer className="sticky-action">
            {!valid && <output>再轻轻选一下，就可以继续啦。</output>}
            <button
              className="primary-button"
              type="button"
              disabled={!valid}
              onClick={next}
            >
              {
                [
                  '',
                  '把这些时间悄悄告诉你',
                  '继续写下一封',
                  '就这样约定',
                  '收下这份邀请',
                ][state.step]
              }{' '}
              <ChevronRight size={18} />
            </button>
          </footer>
        )}
        {notice && (
          <output className="toast" onClick={() => setNotice('')}>
            {notice}
          </output>
        )}
      </section>
    </main>
  );
}

function Summary({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="summary-box">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function CardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-row">
      <small>{label}</small>
      <p>{value}</p>
    </div>
  );
}
