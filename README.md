# Trump Bird: Iron Defense 🦅🛡️

> **"Make Arcade Great Again!"**
A satirical, fast-paced arcade mobile game built with **React Native + Expo (TypeScript)**, featuring a 60 FPS physics engine, dynamic SVG graphics, unlockable wardrobe skins, and a global real-time leaderboard powered by **Supabase**.

---

## 🎮 Features

- **⚡ 60 FPS Arcade Physics Engine:** Custom collision system (AABB & radial) with gravity, progressive scroll speed, particle effects, and screen shake.
- **🛡️ "Iron Dome" Power-Up:** Collect the defensive dome to gain 5 seconds of complete invulnerability and smash through walls and obstacles.
- **📜 "Executive Order" Power-Up:** Signs an immediate executive order that vaporizes all visible obstacles and enemies on screen with massive confetti explosions (`+5 RATINGS`).
- **🧲 "Golden Magnet" Power-Up:** Magnetizes Don Bird for 6 seconds, pulling all nearby power-ups and bonus tokens directly to the player.
- **👔 Unlockable Wardrobe Skins:**
  - **Classic Don:** Presidential Navy Suit & Power Red Tie *(Default)*.
  - **MAGA Patriot:** Red MAGA baseball cap & Stars & Stripes cape *(Unlocked at 10+ score)*.
  - **Palm Beach Golfer:** Sun visor & Florida club polo *(Unlocked at 25+ score)*.
  - **Gala Black-Tie Tuxedo:** Silk tuxedo, bowtie & VIP golden sunglasses *(Unlocked at 50+ score)*.
- **🎙️ Real-Time Satirical Voice Lines:** Integrated speech synthesis (`expo-speech`) delivering hilarious voice lines during rallies, crashes, and rating milestones (*"Tremendous!"*, *"You're Fired!"*, *"Fake News!"*, *"Stop the count!"*).
- **🌆 Dynamic Day/Night & Weather Cycle:** Smooth background transitions from Sunset Glow to Midnight Neon Rally and Golden Dawn.
- **🗓️ Daily Rally (Daily Challenge Mode):** Deterministic daily seed (`YYYY-MM-DD`) where players worldwide compete on the exact same obstacle sequence.
- **🏆 Global Leaderboard (Supabase):** Real-time Top 20 rankings with podium medals and instant score certification.
- **💾 Offline Persistence:** Local storage with `@react-native-async-storage/async-storage` for offline personal bests, daily records, and wardrobe selections.

---

## 🏗️ Tech Stack

- **Framework:** React Native (v0.83+), Expo (SDK 57)
- **Language:** TypeScript
- **Graphics:** SVG (`react-native-svg`), Linear Gradients (`expo-linear-gradient`)
- **Audio & Haptics:** `expo-speech`, `expo-haptics`, `expo-av`
- **Backend & Database:** Supabase (`@supabase/supabase-js`)
- **Storage:** `@react-native-async-storage/async-storage`

---

## 🚀 Getting Started

### 1. Clone and Install
```bash
git clone https://github.com/juanjomadrid/trump-bird-mobile.git
cd trump-bird-mobile
npm install
```

### 2. Configure Supabase Database
Execute [`schema.sql`](./schema.sql) in your Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL CHECK (char_length(player_name) <= 25),
    score INTEGER NOT NULL CHECK (score >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc 
ON public.leaderboard (score DESC, created_at ASC);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Leaderboard" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "Public Insert Leaderboard" ON public.leaderboard FOR INSERT WITH CHECK (true);
```

### 3. Run Development Server
```bash
npx expo start
```

---

## 📱 Release APK
Pre-built native Android Release APK is available in the root directory:
👉 `TrumpBird_Release.apk`

---

## ⚖️ License
MIT License. Created for entertainment and satirical purposes.
