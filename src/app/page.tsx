import Header from '@/components/Header';
import Experience from '@/components/Experience';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';
import Motion from '@/components/Motion';
import RequestDialog from '@/components/RequestDialog';
import Icon from '@/components/Icon';
import { asset } from '@/lib/asset';
import { FAQ, ROOMS } from '@/lib/content';

export default function Page() {
    return (
        <div id="top" className="site">
            <a className="skip-link" href="#main">К содержимому</a>
            <Header />
            <main id="main">
                <section className="hero" aria-labelledby="hero-title">
                    <div className="hero-media"><picture><source media="(max-width: 600px)" srcSet={asset('/assets/images/hero-mobile.webp')} /><img src={asset('/assets/images/hero.webp')} alt="Корпус Дружба над Чёрным морем на Южном берегу Крыма" fetchPriority="high" width="2300" height="1725" data-parallax="0.045" /></picture></div>
                    <div className="hero-shade" />
                    <div className="container hero-content">
                        <p className="hero-location"><span />Южный берег Крыма. У самого моря</p>
                        <h1 id="hero-title"><span>Море.</span><span>Архитектура.</span><span><em>Ваше время.</em></span></h1>
                        <div className="hero-description"><p>Есть места, в которых хочется<br />остаться чуть дольше. Курпаты.</p><button className="button button-cream" data-request="Обратный звонок с первого экрана">Перезвоните мне <Icon /></button></div>
                    </div>
                    <div className="container hero-bottom"><a className="scroll-link" href="#place"><span className="scroll-icon"><Icon name="chevron" /></span>Познакомиться с местом</a><p>44°26′43″ с. ш.<br />34°08′01″ в. д.</p><span className="hero-side-note">Знакомство, которое начинается с удивления</span></div>
                    <a className="hero-index" href="#gallery">Галерея<span>06 ракурсов</span></a>
                </section>

                <section className="place section" id="place" aria-labelledby="place-title">
                    <div className="container place-intro">
                        <div data-reveal><p className="eyebrow"><span className="small-orbit" />Место с собственным характером</p><h2 id="place-title">На шаг ближе<br />к морю.<br /><em>К себе.</em></h2></div>
                        <div className="place-copy" data-reveal><p className="lead">Узнаваемый силуэт над берегом. Море до самого горизонта. И ощущение, что время наконец принадлежит вам.</p><p>Курпаты расположились между Ялтой и Гаспрой. Здесь горный склон встречается с Чёрным морем, а необычная архитектура становится частью пейзажа.</p><a className="text-link" href="#architecture">Узнать историю места <Icon /></a></div>
                    </div>
                    <div className="container place-collage">
                        <figure className="place-main-photo" data-reveal="image"><img src={asset('/assets/images/place.webp')} alt="Панорама корпуса Дружба, гор и побережья" loading="lazy" decoding="async" data-parallax="0.045" /><figcaption>Место встречи моря и архитектуры</figcaption></figure>
                        <div className="place-note" data-reveal><svg className="orbit-diagram" viewBox="0 0 180 180" fill="none" aria-hidden="true"><circle cx="90" cy="90" r="76" /><circle cx="90" cy="90" r="54" /><circle cx="90" cy="90" r="30" /><path d="M90 14v46M90 120v46M14 90h46M120 90h46" /><circle cx="90" cy="90" r="5" /></svg><p>Своя орбита<br />на Южном берегу</p></div>
                        <figure className="place-detail-photo" data-reveal="image"><img src={asset('/assets/images/detail.webp')} alt="Светильник в интерьере корпуса Дружба" loading="lazy" decoding="async" /><figcaption>Характер в каждой детали</figcaption></figure>
                    </div>
                    <div className="container facts"><div data-reveal><strong>1985</strong><span>год открытия<br />корпуса «Дружба»</span></div><div data-reveal><strong>3</strong><span>опоры, на которых<br />держится впечатление</span></div><div data-reveal><strong>8 <small>км</small></strong><span>до центра Ялты<br />по справочным данным</span></div><div data-reveal><strong className="fact-word">Море</strong><span>главный ориентир<br />каждого дня</span></div></div>
                </section>

                <Experience />

                <section className="architecture section" id="architecture" aria-labelledby="architecture-title">
                    <div className="container architecture-heading" data-reveal><p className="eyebrow">Архитектура впечатления</p><h2 id="architecture-title">Словно парит.<br /><em>И остаётся в памяти.</em></h2><p>Кольцо на трёх опорах. Вход через верхнюю террасу. Атриум, наполненный светом. «Дружба» удивляет уже четыре десятилетия.</p></div>
                    <div className="architecture-panorama" data-reveal="image"><img src={asset('/assets/images/architecture.webp')} alt="Кольцевой корпус Дружба с высоты над берегом" loading="lazy" decoding="async" data-parallax="0.055" /><div className="architecture-label"><span className="location-dot" /><p>Корпус «Дружба»<small>Открыт 27 апреля 1985 года</small></p></div></div>
                    <div className="container architecture-bottom" data-reveal><span className="section-number">История, которую видно</span><p>Архитекторы Игорь Василевский и Юрий Стефанчук. Конструктор Нодар Канчели. Смелая идея, которая объединила инженерную точность и свободу курортной архитектуры.</p><button className="text-link" data-request="Обратный звонок: знакомство с Курпатами">Расскажите мне больше <Icon /></button></div>
                </section>

                <section className="rooms section" id="rooms" aria-labelledby="rooms-title">
                    <div className="container section-heading" data-reveal><div><p className="eyebrow">Личное пространство</p><h2 id="rooms-title">Время с видом<br /><em>на отдых</em></h2></div><div className="section-intro"><p>Для тихого утра и неспешного вечера. Познакомьтесь с вариантами размещения и обсудите детали при звонке.</p></div></div>
                    <div className="container room-grid">{ROOMS.map((room, index) => <article className="room-card" key={room.title} data-reveal><div className="room-photo"><img src={asset(`/assets/images/${room.image}.webp`)} alt={`Архивный интерьер номера категории ${room.title}`} loading="lazy" decoding="async" /><span>{room.type}</span><span className="room-number">0{index + 1}</span></div><div className="room-info"><div><h3>{room.title}</h3><p>{room.text}</p></div><button className="circle-button" data-request={room.context} aria-label={`Перезвоните мне: номер ${room.title}`}><Icon /></button></div></article>)}</div>
                    <div className="container rooms-footnote"><p>Архивные фотографии. Актуальное состояние, категории и возможность размещения уточняются при звонке.</p><button className="text-link" data-request="Обратный звонок: варианты размещения">Обсудить отдых <Icon /></button></div>
                </section>

                <section className="day-story" aria-labelledby="day-title"><img src={asset('/assets/images/sea.webp')} alt="Море у берега Курпат" loading="lazy" decoding="async" data-parallax="0.045" /><div className="day-shade" /><div className="container day-content" data-reveal><p className="eyebrow">Просто представьте</p><h2 id="day-title">У этого дня<br /><em>ваш ритм</em></h2><div className="day-moments"><div><span>Утро</span><p>Первый взгляд<br />на море</p></div><div><span>День</span><p>Прогулки<br />и новые ракурсы</p></div><div><span>Вечер</span><p>Разговоры<br />без спешки</p></div></div></div></section>

                <Gallery />

                <section className="location section" id="location" aria-labelledby="location-title"><div className="container location-grid"><div className="location-copy" data-reveal><p className="eyebrow">Ваш Южный берег</p><h2 id="location-title">Место, к которому<br /><em>хочется вернуться</em></h2><p>Дворцы, приморские прогулки и любимые маршруты Большой Ялты. Откройте для себя Южный берег с новой стороны.</p><address><Icon name="pin" /><span>Крым, посёлок Курпаты<br />Алупкинское шоссе, 12</span></address><a className="text-link" href="https://yandex.ru/maps/?pt=34.133665,44.445482&z=15&l=map" target="_blank" rel="noreferrer">Открыть на карте <Icon /></a></div><div className="location-map" data-reveal><svg viewBox="0 0 620 510" fill="none" role="img" aria-label="Схема расположения Курпат на Южном берегу, между Ялтой и Ласточкиным гнездом"><defs><pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0v32" stroke="#bcc7ba" strokeWidth=".4" /></pattern></defs><path fill="#e4e8dc" d="M0 0h620v510H0z" /><path fill="url(#map-grid)" d="M0 0h620v510H0z" /><path d="M0 308c72 36 114-39 181-18s77-21 124-30 51-44 101-54 112-40 214-8v312H0Z" fill="#c1d9dd" /><path d="M0 308c72 36 114-39 181-18s77-21 124-30 51-44 101-54 112-40 214-8" stroke="#85a8a8" strokeWidth="2" /><path d="M-20 260c67 28 135-46 195-27s87-25 131-38 59-36 101-47 112-15 230 2" stroke="#f8f7f0" strokeWidth="14" /><path d="M-20 260c67 28 135-46 195-27s87-25 131-38 59-36 101-47 112-15 230 2" stroke="#b0b5a5" strokeWidth="1" strokeDasharray="5 7" /><g className="map-hills" stroke="#c6ceb9"><path d="M35 78c94-63 116 74 224 2s122 35 214-28M-20 128c94-63 116 74 224 2s122 35 214-28M80 20c94-63 116 74 224 2s122 35 214-28" /></g><circle cx="446" cy="157" r="5" fill="#47646a" /><text x="461" y="160" fill="#47646a" fontSize="16">Ялта</text><circle cx="170" cy="284" r="5" fill="#47646a" /><text x="45" y="333" fill="#47646a" fontSize="13">Ласточкино гнездо</text><path d="m170 290-30 22H90" stroke="#47646a" /><circle cx="309" cy="252" r="34" fill="#f5f1e6" fillOpacity=".7" className="map-pulse" /><circle cx="309" cy="252" r="17" fill="#204c59" /><circle cx="309" cy="252" r="5" fill="#f5f1e6" /><path d="M309 232v-35" stroke="#204c59" /><rect x="260" y="166" width="98" height="30" rx="15" fill="#204c59" /><text x="276" y="186" fill="#fff" fontSize="16">Курпаты</text><text x="340" y="410" fill="#60858c" fontSize="22" fontStyle="italic">Чёрное море</text><path d="M559 43v43m-8-32 8-11 8 11" stroke="#47646a" /><text x="554" y="105" fill="#47646a" fontSize="12">С</text></svg><p>Схема расположения</p></div></div></section>

                <section className="faq section" aria-labelledby="faq-title"><div className="container faq-grid"><div data-reveal><p className="eyebrow">Перед знакомством</p><h2 id="faq-title">Важное<br /><em>об отдыхе</em></h2><p>Если остались вопросы,<br />давайте обсудим их лично.</p><button className="text-link" data-request="Обратный звонок: вопросы об отдыхе">Перезвоните мне <Icon /></button></div><div className="faq-list" data-reveal>{FAQ.map((item, index) => <details key={item.question}><summary><span className="faq-number">0{index + 1}</span>{item.question}<Icon name="plus" /></summary><div className="faq-answer"><p>{item.answer}</p></div></details>)}</div></div></section>

                <section className="contact-section" id="contact" aria-labelledby="contact-title"><div className="contact-photo"><img src={asset('/assets/images/contact.webp')} alt="Корпус Дружба среди зелени у моря" loading="lazy" decoding="async" data-parallax="0.04" /></div><div className="contact-shade" /><div className="container contact-content" data-reveal><p className="eyebrow">Позвольте себе остановиться</p><h2 id="contact-title">С чего начнётся<br /><em>ваша история?</em></h2><p>С разговора о том, как вы хотите провести<br />своё время у моря.</p><button className="button button-cream" data-request="Обратный звонок из финального блока">Перезвоните мне <Icon /></button></div><span className="contact-signature" aria-hidden="true">Курпаты</span></section>
            </main>
            <Footer /><RequestDialog /><Motion />
        </div>
    );
}
