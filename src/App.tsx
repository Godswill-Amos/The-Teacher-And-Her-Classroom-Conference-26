import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  Mic2, 
  Play, 
  FileText, 
  Award, 
  ChevronDown, 
  ShieldCheck, 
  ArrowRight,
  MessageCircle
} from 'lucide-react';

// --- Components ---

const AnnouncementBar = () => (
  <div className="bg-primary-orange text-white text-center py-2.5 px-5 font-mono text-[13px] font-bold tracking-wider sticky top-0 z-50 shadow-md">
    <span className="md:hidden">🔥 Early Bird ends June 30th</span>
    <span className="hidden md:inline">
      🔥 EARLY BIRD ENDS <span className="text-bg-dark bg-white/90 px-1.5 py-0.5 rounded-xs mx-1">JUNE 30TH</span> · LOCK IN YOUR SPOT AT <span className="text-bg-dark bg-white/90 px-1.5 py-0.5 rounded-xs mx-1">₦7,000</span> BEFORE PRICE RISES TO ₦10,000
    </span>
  </div>
);

const Hero = () => (
  <section className="relative bg-[linear-gradient(160deg,#1a1208_0%,#0f0d0b_50%,#150f08_100%)] pt-10 md:pt-16 pb-14 px-5 text-center overflow-hidden">
    <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(249,115,22,0.14)_0%,transparent_70%)] pointer-events-none" />
    
    <div className="relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-block bg-[rgba(249,115,22,0.18)] border border-border-red text-primary-orange font-mono text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-sm mb-4 md:mb-6"
      >
        Virtual Workshop Edition · August 20–21, 2026
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-6xl lg:text-7xl text-text-white max-w-[860px] mx-auto mb-3 md:mb-4 leading-none"
      >
        The Classroom Has <span className="text-primary-orange">Changed.</span> Have You?
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-base md:text-xl text-text-muted max-w-[640px] mx-auto mb-6 md:mb-8 font-normal"
      >
        Join Nigeria's most practical teacher conference. 2 days to get the tools you need for the modern classroom.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3 md:gap-5 mb-7 md:mb-9"
      >
        {[
          { icon: Calendar, text: "20th–21st August, 2026" },
          { icon: Clock, text: "9:00 AM Daily" },
          { icon: MapPin, text: "Virtual Event" },
          { icon: Users, text: "3 Expert Speakers" }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-[10px] md:text-xs text-text-muted tracking-wider">
            <div className="w-1.5 h-1.5 bg-primary-orange rounded-full" />
            {item.text}
          </div>
        ))}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <a 
          href="#register" 
          className="inline-block bg-primary-orange text-white font-mono text-sm font-bold tracking-wider uppercase px-8 md:px-11 py-4 md:py-4.5 rounded-sm transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-[0_4px_28px_rgba(249,115,22,0.4)] hover:shadow-[0_8px_36px_rgba(249,115,22,0.55)]"
        >
          REGISTER NOW · ₦7,000 EARLY BIRD ↓
        </a>
      </motion.div>
      
      <p className="mt-5.5 text-xs text-text-dim font-mono">
        🔒 Secure payment via Flutterwave &nbsp;|&nbsp; Price rises to ₦10,000 on July 1st
      </p>
    </div>
  </section>
);

const LeadSection = () => (
  <section className="bg-bg-mid py-16 px-5 border-y border-border-custom">
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-[740px] mx-auto"
    >
      <span className="font-mono text-[13px] text-gold tracking-widest mb-7 block">Dear Teacher,</span>
      <div className="space-y-4.5 text-[17px] text-[#b8c8df] leading-[1.85]">
        <p>You became a teacher because you care about children and their future.</p>
        <p>You show up every day. Sometimes you are not paid enough. Sometimes people do not say thank you. But you still give it your best.</p>
        <p>But lately, something feels <strong className="text-text-white">off.</strong></p>
        <p>The students in your class today are not the same as the ones you were trained to teach. They lose focus fast. They are not always interested. They live in a world built on AI, phones, and technology that moves very fast.</p>
        <p>But the tools and teaching methods most Nigerian teachers learned in school? <span className="text-primary-orange font-bold">They have not changed.</span></p>
        <p>No one told you how to handle this. No one gave you new training. No one showed you the way.</p>
        <p>So you try your best. You push through. You cope.</p>
        <p>But in your heart, you keep asking this question:</p>
      </div>
      
      <div className="font-display text-2xl md:text-3xl text-text-white tracking-tight leading-tight my-7.5 p-6 border-l-4 border-primary-orange bg-bg-card italic">
        "Am I really getting my students ready for the world out there?"
      </div>
      
      <div className="space-y-4.5 text-[17px] text-[#b8c8df] leading-[1.85]">
        <p>That feeling is real. And it is <strong className="text-text-white">not your fault.</strong></p>
        <p>But here is the truth. The longer you wait, the bigger the gap gets. And your students are the ones who will feel it.</p>
      </div>
    </motion.div>
  </section>
);

const SolutionSection = () => (
  <section className="bg-bg-dark py-16 px-5">
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-[780px] mx-auto text-center"
    >
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">The Solution</div>
      <h2 className="text-3xl md:text-5xl text-text-white mb-5">There Is A <span className="text-primary-orange">Better Way.</span></h2>
      <p className="text-[17px] text-[#b8c8df] mb-3.5 max-w-[620px] mx-auto">That is exactly why <strong className="text-text-white">The Teacher And Her Classroom Conference 2026</strong> was created.</p>
      <p className="text-[17px] text-[#b8c8df] mb-7 max-w-[620px] mx-auto">This is not a boring seminar where you sit and listen and forget everything by Monday. This is a live, hands-on, 2-day virtual workshop made just for Nigerian teachers and school leaders who are ready to stop coping and start growing.</p>
      <a href="#register" className="inline-block bg-primary-orange text-white font-mono text-sm font-bold tracking-wider uppercase px-11 py-4.5 rounded-sm transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-[0_4px_28px_rgba(249,115,22,0.4)]">
        SECURE MY EARLY BIRD SPOT →
      </a>
    </motion.div>
  </section>
);

const IncludedSection = () => (
  <section className="bg-bg-mid py-16 px-5 border-y border-border-custom">
    <div className="max-w-[1000px] mx-auto">
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">What Is Included</div>
      <h2 className="text-3xl md:text-5xl text-text-white mb-3.5">Everything You Get</h2>
      <p className="text-base text-text-muted max-w-[580px] mb-10">One registration. Two days. Everything you need to change your classroom.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Mic2, title: "2 Days of Live Sessions", desc: "You will learn from 3 real experts in live sessions. No boring slides. No fluff. Just tools you can use right away." },
          { icon: Play, title: "Full Session Replays", desc: "Cannot make it live? No worries. Every session is recorded. You can watch it again and again at your own time." },
          { icon: FileText, title: "Resource Materials", desc: "You will get templates, tools, and resources from all the speakers. Things you can download and use right away." },
          { icon: Award, title: "Participation Certificate", desc: "Every person who joins gets a certificate. You can add it to your portfolio or use it to grow your career." },
          { icon: Users, title: "Exclusive Community Access", desc: "You will join a group of teachers who want to grow. Ask questions, share wins, and keep learning after the conference." },
          { icon: MapPin, title: "Open to All Levels", desc: "Whether you teach primary, secondary, or run a school, this conference was made for you." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card border border-border-custom rounded-sm p-6 transition-colors hover:border-border-red"
          >
            <item.icon className="w-8 h-8 text-primary-orange mb-3" />
            <h4 className="text-xl text-text-white mb-2">{item.title}</h4>
            <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const HostSection = () => (
  <section className="bg-bg-dark py-16 px-5">
    <div className="max-w-[1000px] mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Your Host</div>
        <h2 className="text-3xl md:text-5xl text-text-white">Meet The Woman Behind The Conference</h2>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-[680px] mx-auto bg-bg-card border border-border-custom rounded-sm overflow-hidden flex flex-col md:flex-row items-center md:items-stretch"
      >
        <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-auto p-6 flex items-center justify-center">
          <div className="w-full h-full rounded-lg border-2 border-primary-orange overflow-hidden">
            <img 
              src="https://www.theteacherandherclassroom.ng/wp-content/uploads/2026/04/Mrs.-Stephanie.jpg" 
              alt="Stephanie Joel-Ovo" 
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 p-7 md:p-8 flex flex-col justify-center">
          <h3 className="font-['Bebas_Neue'] text-[42px] text-text-white leading-none mb-2 tracking-wide">Stephanie Joel-Ovo</h3>
          <div className="font-['Space_Mono'] text-[12px] text-primary-orange uppercase tracking-widest mb-4">
            Host & Founder · Stephanie Global Education
          </div>
          <p className="font-mono text-[15px] text-text-muted leading-relaxed mb-6">
            Stephanie Joel-Ovo is the founder of Stephanie Global Education and the driving force behind The Teacher And Her Classroom Conference. Passionate about transforming education across Nigeria, she has dedicated her work to equipping teachers, empowering school leaders, and ensuring every child has access to quality, future-ready education. This conference is her vision made real.
          </p>
          <div className="inline-block bg-primary-orange/10 border border-primary-orange/30 text-primary-orange font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm self-start">
            POWERED BY STEPHANIE GLOBAL EDUCATION
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const SpeakersSection = () => (
  <section className="bg-bg-dark py-16 px-5">
    <div className="max-w-[1000px] mx-auto">
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Your Speakers</div>
      <h2 className="text-3xl md:text-5xl text-text-white mb-3.5">3 Experts. Real Experience. <span className="text-primary-orange">Zero Fluff.</span></h2>
      <p className="text-base text-text-muted max-w-[580px] mb-10">Every speaker is living what they teach. No theory. Just real experience.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: "Fii Stephen",
            title: "AI Consultant & Growth Strategist\nFounder, AI Literacy Academy",
            bio: `Fii Stephen is an AI Consultant, Growth Marketing, and Digital Marketing Professional with over 8 years of experience. He is Generative AI Certified by IBM, AI for Marketing Certified by Davidson College, North Carolina, USA, and one of the Meta Certified Digital Marketing Associates in West Africa. 

Over the past 12 months, Fii has trained over 1,500 people in AI, digital marketing, and personal development. He was awarded the YALI Star of Business as an outstanding participant of the USAID and Mastercard foundation-sponsored Young African Leaders Initiative regional leadership program, in Accra, Ghana.

Fii is the Founder of the AI Literacy Academy and Co-Founder of Claywings Technologies.

He was also recently selected as a research group member at the Centre for AI and Digital Policy, Washington DC, USA.`,
            img: "https://www.theteacherandherclassroom.ng/wp-content/uploads/2026/04/Fii-Stephen-Picture-1.jpeg"
          },
          {
            name: "Similoluwa Adekoye",
            title: "Nigerian Education Advocate\nCertified Chemistry Teacher & Freelance Writer",
            bio: `Similoluwa Adekoye is a Nigerian education advocate, certified Chemistry teacher and expert freelance writer dedicated to transforming educational outcomes across Nigeria. With a B.Sc. Ed. in Chemistry and professional teaching certification (TRCN), she brings both subject expertise and pedagogical insight to her work.

Through her writing and advocacy, Similoluwa addresses curriculum gaps, teacher welfare, and systemic barriers to quality education. She is passionate about equipping teachers with practical tools to succeed in real classrooms and empowering students to thrive. Her work centers on one mission: ensuring every Nigerian child has access to quality education.`,
            img: "https://www.theteacherandherclassroom.ng/wp-content/uploads/2026/04/Similoluwa-Adekoye.jpeg"
          },
          {
            name: "George O. Agbede",
            title: "Online Education Expert\nMicrosoft Certified Educator · Lead Tutor, GLS Academy",
            bio: `George O. Agbede is a seasoned educator, teacher-trainer, and digital learning coach with over 10 years of classroom and virtual teaching experience. As the Lead Tutor at GLS Academy and a Microsoft Certified Educator, he has helped hundreds of students excel in international exams like SAT and UK 11 + while mentoring fellow teachers to transition into online teaching successfully.

He holds multiple certifications including PGCEi, QTS, IGCSE, and TRCN, and is passionate about empowering educators to thrive in 21 st-century classrooms. George is known for his engaging, tech-savvy teaching style and his commitment to building learner-centered environments that foster curiosity, collaboration, and lifelong learning.

Through his work, he equips teachers with the tools and mindset to deliver impactful education beyond borders.`,
            img: "https://www.theteacherandherclassroom.ng/wp-content/uploads/2026/04/George-Agbede.jpeg"
          }
        ].map((speaker, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-bg-card border border-border-custom rounded-sm overflow-hidden transition-all hover:-translate-y-1 hover:border-border-red group"
          >
            <div className="w-full aspect-[3/4] overflow-hidden relative bg-bg-card2">
              <img 
                src={speaker.img} 
                alt={speaker.name} 
                className="w-full h-full object-cover object-top grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-card via-bg-card/40 to-transparent" />
            </div>
            <div className="p-5 pb-6">
              <h3 className="text-[28px] text-text-white mb-1">{speaker.name}</h3>
              <div className="font-mono text-[11px] text-primary-orange tracking-wider uppercase mb-3.5 leading-relaxed whitespace-pre-line">
                {speaker.title}
              </div>
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">{speaker.bio}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const LearnSection = () => (
  <section className="bg-bg-mid py-16 px-5 border-y border-border-custom">
    <div className="max-w-[1000px] mx-auto">
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">What You Will Learn</div>
      <h2 className="text-3xl md:text-5xl text-text-white mb-10">You Will Leave With These Skills:</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-[960px] mx-auto">
        {[
          { num: "01", title: "AI Tools for the Classroom", desc: "Learn how to use AI to plan lessons faster, mark work quicker, and save time. You will not lose your personal touch as a teacher." },
          { num: "02", title: "Modern Classroom Management", desc: "Get simple steps to bring your students back to focus. These are things you can try in your class the very next day." },
          { num: "03", title: "Navigating Nigeria's System", desc: "Learn how to work within the real challenges of teaching in Nigeria and still get great results for your students." },
          { num: "04", title: "Teaching Online for Income", desc: "Find out how to take your teaching skills online, reach more students, and earn money beyond your regular salary." },
          { num: "05", title: "Future-Ready Classroom Tools", desc: "Get the tools and ideas that will make you a teacher your students will never forget." },
          { num: "06", title: "Community and Accountability", desc: "You will not be alone after this. Join other teachers who are growing and who will keep you on track." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-4 items-start bg-bg-card border border-border-custom rounded-sm p-5 transition-colors hover:border-border-red"
          >
            <div className="font-display text-4xl text-primary-orange opacity-50 leading-none shrink-0 w-9">{item.num}</div>
            <div>
              <h4 className="text-lg text-text-white mb-1.5">{item.title}</h4>
              <p className="text-[13px] text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const ComparisonTable = () => (
  <section className="bg-bg-dark py-16 px-5">
    <div className="max-w-[1000px] mx-auto">
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Free Content vs This Conference</div>
      <h2 className="text-3xl md:text-5xl text-text-white mb-10">Why Not Just Watch YouTube?</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full max-w-[760px] mx-auto border-collapse rounded-sm overflow-hidden">
          <thead>
            <tr className="bg-bg-card2">
              <th className="p-4 px-5 text-left font-mono text-xs tracking-widest uppercase text-text-muted border-b-2 border-border-custom">Feature</th>
              <th className="p-4 px-5 text-left font-mono text-xs tracking-widest uppercase text-text-muted border-b-2 border-border-custom">Free YouTube / Content</th>
              <th className="p-4 px-5 text-left font-mono text-xs tracking-widest uppercase text-gold border-b-2 border-border-custom bg-[rgba(240,165,0,0.06)]">✦ This Conference</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              ["Tools made for Nigerian teachers", "❌ Too general", "✅ Made for you"],
              ["Ask questions live", "❌ Not possible", "✅ Both days"],
              ["Join a teacher community", "❌ Not included", "✅ Included"],
              ["Get a certificate", "❌ Not included", "✅ Included"],
              ["Watch recordings later", "❌ Not always", "✅ Yours to keep"],
              ["Download tools and resources", "❌ All over the place", "✅ Ready for you"],
              ["3 expert speakers together", "❌ Hours of searching", "✅ 2 days"]
            ].map((row, i) => (
              <tr key={i} className={`border-b border-border-custom ${i % 2 === 1 ? 'bg-[rgba(255,255,255,0.018)]' : ''}`}>
                <td className="p-3.5 px-5 text-text-white font-semibold">{row[0]}</td>
                <td className="p-3.5 px-5 text-text-dim">{row[1]}</td>
                <td className="p-3.5 px-5 text-gold font-bold bg-[rgba(240,165,0,0.04)]">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

const PricingSection = () => (
  <section className="bg-bg-mid py-20 px-5 border-y border-border-custom" id="register">
    <div className="max-w-[1000px] mx-auto text-center">
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">How Much Does It Cost</div>
      <h2 className="text-3xl md:text-5xl text-text-white mb-3.5">Get Your Spot Today</h2>
      <p className="text-base text-text-muted max-w-[580px] mx-auto mb-10">The early bird price will not last. Sign up before June ends and save ₦3,000.</p>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-[560px] mx-auto bg-bg-card border border-border-red rounded-sm overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.12)]"
      >
        <div className="bg-primary-orange py-4.5 px-7.5 text-center">
          <p className="font-mono text-[13px] font-bold tracking-widest uppercase text-[rgba(255,255,255,0.9)]">🔥 EARLY BIRD · ENDS JUNE 30TH, 2026</p>
        </div>
        <div className="p-9 md:p-10 text-left">
          <div className="font-mono text-[15px] text-text-dim line-through mb-1">Regular Price: ₦10,000</div>
          <div className="font-display text-7xl text-gold leading-none mb-1.5">₦7,000</div>
          <div className="font-mono text-[11px] text-text-muted tracking-wider mb-7">EARLY BIRD PRICE · SAVES YOU ₦3,000 · ENDS JUNE 30TH</div>
          
          <hr className="border-border-custom mb-6" />
          
          <ul className="space-y-2.5 mb-8">
            {[
              "2-Day Live Virtual Workshop",
              "Full Session Replays",
              "Downloadable Resource Materials",
              "Participation Certificate",
              "Exclusive Community Access"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5 text-[15px] text-[#c8d8ee] border-b border-border-custom last:border-none">
                <div className="w-5.5 h-5.5 bg-primary-orange rounded-sm flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          
          <div className="bg-[rgba(200,16,46,0.08)] border border-border-red rounded-sm p-3.5 mb-7 text-center">
            <p className="font-mono text-xs text-primary-orange tracking-wider leading-relaxed">⚠️ Price goes up to ₦10,000 on July 1st, 2026.<br/>Sign up in May or June to pay only ₦7,000.</p>
          </div>
          
          <a 
            href="#" 
            className="block w-full bg-primary-orange text-white text-center font-mono text-[15px] font-bold tracking-wider uppercase py-5 rounded-sm transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-[0_4px_28px_rgba(249,115,22,0.4)]"
          >
            YES · REGISTER ME FOR ₦7,000 →
          </a>
          <p className="text-center mt-3.5 text-xs text-text-dim font-mono">
            🔒 Secure payment via Flutterwave &nbsp;|&nbsp; Conference: Aug 20–21, 2026
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

const GuaranteeSection = () => (
  <section className="bg-bg-dark py-16 px-5">
    <div className="max-w-[1000px] mx-auto">
      <div className="text-center mb-9">
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Our Promise</div>
        <h2 className="text-3xl md:text-5xl text-text-white">We Have Your Back</h2>
      </div>
      <div className="max-w-[640px] mx-auto flex flex-col md:flex-row gap-7 items-center md:items-start bg-bg-card border border-border-custom rounded-sm p-9">
        <div className="w-20 h-20 bg-primary-orange rounded-full flex items-center justify-center text-3xl shrink-0 shadow-[0_0_30px_rgba(249,115,22,0.35)]">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-[28px] text-text-white mb-2.5">Here Is What We Promise You</h3>
          <p className="text-[15px] text-text-muted leading-[1.7]">Show up. Pay attention. Use what you learn. If you do not feel ready and excited to change your classroom after Day 1, reach out to us and we will make it right. We stand behind every session, every speaker, and every resource in this conference.</p>
        </div>
      </div>
    </div>
  </section>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "Is this for primary or secondary school teachers?", a: "It is for both. This conference is open to teachers and school leaders at all levels. Primary, secondary, and beyond. If you work in education in Nigeria, this is for you." },
    { q: "What if I cannot attend live?", a: "No problem. Every session is recorded. The replays are yours to keep. You can watch at any time that works for you." },
    { q: "What do I need to attend?", a: "Just a phone or laptop and a good internet connection. You do not need any special app or technical skills. We will send you the link before the event starts." },
    { q: "I am not good with technology. Will I be able to follow?", a: "Yes! Everything is explained step by step. We start from the basics. You do not need to know anything about tech before you come." },
    { q: "When will I receive the platform link?", a: "We will send the link to all registered participants before August 20th. You will not miss anything." },
    { q: "Is my payment safe?", a: "Yes. We use Flutterwave to process all payments. It is one of the most trusted payment platforms in Africa. Your money and your details are safe." }
  ];

  return (
    <section className="bg-bg-mid py-16 px-5 border-y border-border-custom">
      <div className="max-w-[1000px] mx-auto">
        <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">FAQ</div>
        <h2 className="text-3xl md:text-5xl text-text-white mb-10">Got Questions? We Have Answers.</h2>
        
        <div className="max-w-[720px] mx-auto">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border-custom">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full bg-none border-none text-left text-text-white font-mono text-base font-bold py-5 pr-11 relative cursor-pointer hover:text-gold transition-colors flex items-center justify-between"
              >
                {faq.q}
                <ChevronDown className={`w-5.5 h-5.5 text-primary-orange transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[15px] text-text-muted leading-[1.7] pb-5">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => (
  <section className="bg-[linear-gradient(160deg,#150f08_0%,#0f0d0b_60%,#1a1208_100%)] py-24 px-5 text-center relative overflow-hidden">
    <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(249,115,22,0.16)_0%,transparent_70%)] pointer-events-none" />
    
    <div className="relative z-10">
      <div className="inline-block font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-primary-orange mb-3 px-2.5 py-1 border-l-3 border-primary-orange">Do Not Wait</div>
      <h2 className="text-3xl md:text-5xl lg:text-6xl text-text-white max-w-[800px] mx-auto mb-4">Your Students Need A <span className="text-primary-orange">Future-Ready</span> Teacher.</h2>
      <p className="text-[17px] text-text-muted max-w-[520px] mx-auto mb-9">The price goes up on July 1st. The conference starts on August 20th. Sign up today and take the first step.</p>
      <a href="#register" className="inline-block bg-primary-orange text-white font-mono text-[15px] font-bold tracking-wider uppercase px-13 py-5 rounded-sm transition-all hover:bg-primary-dark hover:-translate-y-0.5 shadow-[0_4px_28px_rgba(249,115,22,0.4)]">
        REGISTER NOW · ₦7,000 EARLY BIRD →
      </a>
      <p className="mt-4.5 text-xs text-text-dim font-mono tracking-wider">
        Price rises to ₦10,000 on July 1st &nbsp;·&nbsp; Powered by Stephanie Global Education
      </p>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-bg-card2 border-t border-border-custom py-7 px-5 text-center">
    <p className="font-mono text-[11px] text-text-dim tracking-wider flex flex-wrap items-center justify-center gap-2">
      © 2026 Stephanie Global Education &nbsp;·&nbsp; The Teacher And Her Classroom Conference &nbsp;·&nbsp; 
      <a href="#" className="text-primary-orange hover:underline flex items-center gap-1">
        <MessageCircle className="w-3 h-3" /> WhatsApp Support
      </a>
    </p>
  </footer>
);

export default function App() {
  return (
    <div className="relative min-h-screen">
      <div className="noise-overlay" />
      <AnnouncementBar />
      <main>
        <Hero />
        <LeadSection />
        <SolutionSection />
        <IncludedSection />
        <HostSection />
        <SpeakersSection />
        <LearnSection />
        <ComparisonTable />
        <PricingSection />
        <GuaranteeSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
