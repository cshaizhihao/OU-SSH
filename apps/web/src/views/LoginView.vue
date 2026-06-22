<template>
  <div class="login-page flex items-center justify-center relative text-slate-800 h-screen overflow-hidden">
    <div class="ambient-glow-purple"></div>
    <div class="ambient-glow-blue"></div>

    <main class="w-full max-w-[420px] p-8 sm:p-10 glass-card rounded-3xl" id="loginCard">
      <div class="text-center mb-8 stagger-item">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue mb-4 shadow-lg shadow-blue-500/30">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">OU-SSH</span>
        </h1>
        <p class="mt-2 text-sm text-slate-500 font-medium">Node Management System</p>
      </div>

      <form class="space-y-5" @submit.prevent="triggerLogin">
        <div class="stagger-item">
          <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">账号</label>
          <input
            v-model="username"
            type="text"
            placeholder="admin"
            required
            class="w-full px-4 py-3 rounded-xl text-sm flat-input placeholder-slate-400 font-medium"
          >
        </div>

        <div class="stagger-item">
          <div class="flex justify-between items-center mb-1.5">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide">密码</label>
          </div>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full px-4 py-3 rounded-xl text-sm flat-input placeholder-slate-400 font-mono tracking-widest"
          >
        </div>

        <div class="stagger-item pt-2">
          <button
            type="submit"
            id="mainLoginBtn"
            :disabled="loading"
            class="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-brand-green hover:bg-brand-greenHover transition-all shadow-lg shadow-green-500/30 flex justify-center items-center"
            :class="{ 'opacity-80 cursor-not-allowed': loading }"
          >
            <span id="btnText" :class="{ hidden: loading }">{{ buttonText }}</span>
            <svg id="btnLoader" class="w-5 h-5 animate-spin" :class="{ hidden: !loading }" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>
      </form>

      <div class="relative my-7 stagger-item">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-slate-200"></div>
        </div>
        <div class="relative flex justify-center text-xs font-semibold">
          <span class="px-3 text-slate-400" style="background: rgba(255,255,255,0.8);">或者</span>
        </div>
      </div>

      <div class="stagger-item">
        <button
          type="button"
          @click="triggerGitHubOAuth"
          class="w-full py-3.5 rounded-xl text-sm font-bold outline-btn flex justify-center items-center gap-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
          </svg>
          通过 GitHub 授权登录
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import gsap from 'gsap';
import { useAuthStore } from '../stores/auth.js';
import { apiUrl } from '../services/api.js';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const username = ref('admin');
const password = ref('');
const loading = ref(false);
const buttonText = ref('验证并登录');

onMounted(() => {
  if (route.query.error) {
    const messages = {
      github_oauth_not_configured: 'GitHub 未配置',
      github_account_not_linked: 'GitHub 未绑定',
      github_oauth_invalid_callback: 'GitHub 回调无效'
    };
    buttonText.value = messages[route.query.error] || 'GitHub 授权失败';
  }

  gsap.from('.ambient-glow-purple, .ambient-glow-blue', {
    duration: 2.5,
    opacity: 0,
    scale: 0.8,
    ease: 'power2.out',
    stagger: 0.3
  });

  gsap.from('#loginCard', {
    duration: 1.2,
    y: 30,
    opacity: 0,
    ease: 'back.out(1.2)',
    delay: 0.1
  });

  gsap.from('.stagger-item', {
    duration: 0.8,
    y: 15,
    opacity: 0,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.3
  });
});

async function triggerLogin() {
  if (loading.value) {
    return;
  }

  loading.value = true;
  buttonText.value = '验证并登录';

  try {
    await auth.login({
      username: username.value,
      password: password.value
    });
    buttonText.value = '进入管理面板...';
    await router.push('/dashboard');
  } catch (error) {
    buttonText.value = '登录失败，请重试';
  } finally {
    loading.value = false;
  }
}

function triggerGitHubOAuth(event) {
  const githubBtn = event.currentTarget;
  gsap.to(githubBtn, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      window.location.href = apiUrl('/auth/github');
    }
  });
}
</script>
