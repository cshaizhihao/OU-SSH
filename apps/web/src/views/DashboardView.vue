<template>
  <div class="dashboard-page flex text-slate-800 h-screen overflow-hidden">
    <div class="ambient-glow-purple"></div>
    <div class="ambient-glow-blue"></div>

    <aside class="sidebar w-64 h-full flex flex-col justify-between py-6">
      <div>
        <div class="px-6 mb-10 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center shadow-md shadow-blue-500/30">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
          </div>
          <h1 class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple tracking-tight">OU-SSH</h1>
        </div>

        <nav class="flex flex-col text-sm font-medium text-slate-600">
          <a href="#" @click.prevent="switchView('view-keygen')" :class="navClass('view-keygen')" class="nav-item px-6 py-3.5 flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
            密钥生成器
          </a>
          <a href="#" @click.prevent="switchView('view-github')" :class="navClass('view-github')" class="nav-item px-6 py-3.5 flex items-center gap-3">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg>
            GitHub 托管同步
          </a>
          <a href="#" @click.prevent="switchView('view-script')" :class="navClass('view-script')" class="nav-item px-6 py-3.5 flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            新机初始化指令
          </a>
          <a href="#" @click.prevent="switchView('view-docs')" :class="navClass('view-docs')" class="nav-item px-6 py-3.5 flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            操作与安全指南
          </a>
        </nav>
      </div>

      <div class="px-6 flex items-center gap-3" @click="openSecuritySettings">
        <div class="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shadow-md">欧</div>
        <div class="text-sm">
          <p class="font-bold text-slate-800">{{ auth.user?.username || 'Admin' }}</p>
          <p class="text-xs text-slate-500">System Manager</p>
        </div>
      </div>
    </aside>

    <main class="flex-1 relative z-10 p-10 overflow-hidden flex items-center justify-center">
      <section id="view-keygen" class="view-section w-full max-w-2xl" :class="{ active: activeView === 'view-keygen' }">
        <div class="content-card p-8 stagger-card">
          <h2 class="text-2xl font-extrabold text-slate-800 mb-2">生成强加密 SSH 密钥</h2>
          <p class="text-sm text-slate-500 mb-8">使用 Ed25519 算法生成高安全性公私钥对，拒绝弱口令暴力破解。</p>

          <div class="space-y-6">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">密钥别名 (可选)</label>
              <input v-model="keyAlias" type="text" placeholder="e.g. macbook-pro-key" class="w-full px-4 py-3 rounded-xl text-sm flat-input font-medium">
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="button"
                @click="generateKeyPair"
                :disabled="isGenerating"
                class="flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-brand-green hover:bg-brand-greenHover transition-all shadow-lg shadow-green-500/30 flex justify-center items-center gap-2"
                :class="{ 'opacity-80 cursor-not-allowed': isGenerating }"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                {{ generateText }}
              </button>
              <button
                type="button"
                @click="downloadGeneratedZip"
                :disabled="!downloadReady"
                class="flex-1 py-3.5 rounded-xl text-sm font-bold outline-btn flex justify-center items-center gap-2"
                :class="{ 'opacity-50 cursor-not-allowed': !downloadReady }"
                title="请先生成密钥"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                下载 .zip 压缩包
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="view-github" class="view-section w-full max-w-2xl" :class="{ active: activeView === 'view-github' }">
        <div class="content-card p-8 stagger-card">
          <h2 class="text-2xl font-extrabold text-slate-800 mb-2">配置 GitHub 托管</h2>
          <p class="text-sm text-slate-500 mb-8">绑定你的 GitHub 账号，后续所有新机器将直接从 GitHub 拉取公钥完成免密配置。</p>

          <div class="space-y-6">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">GitHub Username</label>
              <input v-model="githubUsername" type="text" id="githubInput" placeholder="输入你的 GitHub 用户名" class="w-full px-4 py-3 rounded-xl text-sm flat-input font-medium">
            </div>

            <div class="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div class="text-sm text-blue-800">
                <p class="font-bold mb-1">去 GitHub 登记刚才生成的公钥</p>
                <p class="opacity-80 mb-3">将公钥文本（.pub）内容添加到 GitHub 的 SSH Keys 中才能生效。</p>
                <a href="https://github.com/settings/keys" target="_blank" class="inline-block px-4 py-2 bg-white text-brand-blue font-bold rounded-lg shadow-sm hover:shadow transition-all text-xs">
                  前往 GitHub 设置页 ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="view-script" class="view-section w-full max-w-3xl" :class="{ active: activeView === 'view-script' }">
        <div class="content-card p-8 stagger-card flex flex-col h-full">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-extrabold text-slate-800 mb-1">一键加固与部署脚本</h2>
              <p class="text-sm text-slate-500">在新服务器 Root 环境下执行此脚本，将自动拉取公钥并禁用密码登录。</p>
            </div>
            <button
              type="button"
              @click="copyScript"
              class="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              {{ copied ? '复制成功' : '复制代码' }}
            </button>
          </div>

          <div class="code-block p-6 text-sm leading-relaxed relative flex-1">
<pre><code># 1. 设定绑定的 GitHub 账号
export GH_USER="<span id="scriptUserRender" class="text-brand-green font-bold">{{ scriptUsername }}</span>"

# 2. 创建目录并拉取公钥
mkdir -p ~/.ssh && chmod 700 ~/.ssh
curl -fsSL https://github.com/$GH_USER.keys >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 3. 强制禁用密码，开启密钥认证
if grep -qE '^[#[:space:]]*PasswordAuthentication' /etc/ssh/sshd_config; then
  sudo sed -i -E 's/^[#[:space:]]*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
else
  echo 'PasswordAuthentication no' | sudo tee -a /etc/ssh/sshd_config >/dev/null
fi

if grep -qE '^[#[:space:]]*PubkeyAuthentication' /etc/ssh/sshd_config; then
  sudo sed -i -E 's/^[#[:space:]]*PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
else
  echo 'PubkeyAuthentication yes' | sudo tee -a /etc/ssh/sshd_config >/dev/null
fi

# 4. 重启 SSH 服务生效
sudo systemctl restart sshd || sudo systemctl restart ssh

echo -e "\n[OK] 公钥部署完成！密码登录已禁用。"</code></pre>
          </div>
        </div>
      </section>

      <section id="view-docs" class="view-section w-full max-w-2xl" :class="{ active: activeView === 'view-docs' }">
        <div class="content-card p-8 stagger-card">
          <h2 class="text-2xl font-extrabold text-slate-800 mb-6">⚠️ 安全操作必读指南</h2>

          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h3 class="font-bold text-slate-800 mb-1">永远保持一个备用窗口</h3>
                <p class="text-sm text-slate-600 leading-relaxed">在执行一键禁用密码脚本后，<strong class="text-red-500">千万不要立即关闭当前的 SSH 终端窗口</strong>。如果公钥验证失败，你将无法再次通过密码登录服务器。</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h3 class="font-bold text-slate-800 mb-1">新建标签页进行测试</h3>
                <p class="text-sm text-slate-600 leading-relaxed">请在 Termius (或你常用的 SSH 客户端) 中新建一个标签页，将认证方式修改为 Key，并尝试免密登录。确认可以成功进入服务器后，再安全关闭旧窗口。</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h3 class="font-bold text-slate-800 mb-1">私钥绝不上云</h3>
                <p class="text-sm text-slate-600 leading-relaxed">下载的 `.zip` 解压后，请将 `id_ed25519` (私钥文件) 妥善保存在本地电脑的 `~/.ssh/` 目录下。绝对不要将此文件上传至任何服务器中。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="view-security" class="view-section w-full max-w-2xl" :class="{ active: activeView === 'view-security' }">
        <div class="content-card p-8 stagger-card max-h-[calc(100vh-5rem)] overflow-y-auto">
          <h2 class="text-2xl font-extrabold text-slate-800 mb-2">安全设定</h2>
          <p class="text-sm text-slate-500 mb-8">修改系统登录账号与密码，并绑定 GitHub 授权登录。</p>

          <form class="space-y-5" @submit.prevent="saveSecuritySettings">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">登录账号</label>
              <input v-model="securityForm.username" type="text" required class="w-full px-4 py-3 rounded-xl text-sm flat-input font-medium">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">当前密码</label>
              <input v-model="securityForm.currentPassword" type="password" required class="w-full px-4 py-3 rounded-xl text-sm flat-input font-mono tracking-widest">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">新密码</label>
                <input v-model="securityForm.newPassword" type="password" :required="auth.mustChangeCredentials" class="w-full px-4 py-3 rounded-xl text-sm flat-input font-mono tracking-widest">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">确认新密码</label>
                <input v-model="securityForm.confirmPassword" type="password" :required="auth.mustChangeCredentials" class="w-full px-4 py-3 rounded-xl text-sm flat-input font-mono tracking-widest">
              </div>
            </div>

            <div class="flex gap-4 pt-3">
              <button type="submit" class="flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-brand-green hover:bg-brand-greenHover transition-all shadow-lg shadow-green-500/30 flex justify-center items-center gap-2">
                {{ saveText }}
              </button>
              <button type="button" @click="bindGithubLogin" class="flex-1 py-3.5 rounded-xl text-sm font-bold outline-btn flex justify-center items-center gap-2">
                {{ githubLinkText }}
              </button>
            </div>
          </form>

          <div class="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-800">GitHub OAuth 配置</h3>
                <p class="text-xs text-slate-500 mt-1">创建 OAuth App 后粘贴 Client ID 与 Secret。</p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-bold" :class="githubOAuthConfigured ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'">
                {{ githubOAuthConfigured ? '已配置' : '未配置' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Client ID</label>
                <input v-model="githubOAuthForm.clientId" type="text" class="w-full px-4 py-3 rounded-xl text-sm flat-input font-medium" placeholder="GitHub OAuth Client ID">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Client Secret</label>
                <input v-model="githubOAuthForm.clientSecret" type="password" class="w-full px-4 py-3 rounded-xl text-sm flat-input font-medium" placeholder="GitHub OAuth Client Secret">
              </div>
            </div>

            <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p class="text-xs font-bold text-blue-800 mb-2">Authorization callback URL</p>
              <div class="flex gap-2">
                <input v-model="githubOAuthForm.callbackUrl" type="text" class="flex-1 px-3 py-2 rounded-lg text-xs flat-input font-mono">
                <button type="button" @click="copyGithubCallbackUrl" class="px-3 py-2 bg-white text-brand-blue font-bold rounded-lg shadow-sm hover:shadow transition-all text-xs">
                  {{ callbackCopyText }}
                </button>
              </div>
              <p class="text-xs text-blue-700 mt-2">OAuth App 权限范围：read:user user:email</p>
            </div>

            <div class="flex gap-4">
              <a :href="githubOAuthCreateUrl" target="_blank" class="flex-1 py-3 rounded-xl text-sm font-bold outline-btn flex justify-center items-center gap-2">
                打开 GitHub 创建页
              </a>
              <button type="button" @click="saveGithubOAuthSettings" class="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2">
                {{ githubOAuthSaveText }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div v-if="showFirstLoginModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
      <div class="content-card p-8 w-full max-w-[420px] stagger-card">
        <h2 class="text-2xl font-extrabold text-slate-800 mb-2">首次登录安全设定</h2>
        <p class="text-sm text-slate-500 mb-8">默认账号密码为 admin / admin，请立即进入安全设定修改登录账号与密码。</p>
        <button type="button" @click="ackFirstLogin" class="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-brand-green hover:bg-brand-greenHover transition-all shadow-lg shadow-green-500/30 flex justify-center items-center">
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import gsap from 'gsap';
import { useAuthStore } from '../stores/auth.js';
import { apiRequest, apiUrl } from '../services/api.js';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const activeView = ref('view-keygen');
const keyAlias = ref('');
const isGenerating = ref(false);
const downloadReady = ref(false);
const zipObjectUrl = ref('');
const zipFilename = ref('ou-ssh-ed25519.zip');
const githubUsername = ref('');
const copied = ref(false);
const showFirstLoginModal = ref(false);
const generateText = ref('一键生成密钥对');
const saveText = ref('保存安全设定');
const githubLinkText = ref('绑定 GitHub 登录');
const githubOAuthConfigured = ref(false);
const githubOAuthCreateUrl = ref('https://github.com/settings/applications/new');
const githubOAuthSaveText = ref('保存 OAuth 配置');
const callbackCopyText = ref('复制');

const securityForm = reactive({
  username: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const githubOAuthForm = reactive({
  clientId: '',
  clientSecret: '',
  callbackUrl: ''
});

const scriptUsername = computed(() => githubUsername.value.trim() || 'YOUR_GITHUB_USERNAME');

const scriptForCopy = computed(() => `# 1. 设定绑定的 GitHub 账号
export GH_USER="${scriptUsername.value}"

# 2. 创建目录并拉取公钥
mkdir -p ~/.ssh && chmod 700 ~/.ssh
curl -fsSL https://github.com/$GH_USER.keys >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 3. 强制禁用密码，开启密钥认证
if grep -qE '^[#[:space:]]*PasswordAuthentication' /etc/ssh/sshd_config; then
  sudo sed -i -E 's/^[#[:space:]]*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
else
  echo 'PasswordAuthentication no' | sudo tee -a /etc/ssh/sshd_config >/dev/null
fi

if grep -qE '^[#[:space:]]*PubkeyAuthentication' /etc/ssh/sshd_config; then
  sudo sed -i -E 's/^[#[:space:]]*PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
else
  echo 'PubkeyAuthentication yes' | sudo tee -a /etc/ssh/sshd_config >/dev/null
fi

# 4. 重启 SSH 服务生效
sudo systemctl restart sshd || sudo systemctl restart ssh

echo -e "\\n[OK] 公钥部署完成！密码登录已禁用。"
`);

onMounted(async () => {
  const tokenFromQuery = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token;

  if (tokenFromQuery) {
    auth.setToken(tokenFromQuery);
    await router.replace({ path: '/dashboard', query: {} });
  }

  try {
    const user = await auth.loadMe();
    await loadGithubOAuthSettings();

    securityForm.username = user.username;
    githubUsername.value = user.githubLogin || '';
    githubLinkText.value = user.githubLinked
      ? '已绑定 GitHub'
      : githubOAuthConfigured.value
        ? '绑定 GitHub 登录'
        : 'GitHub 未配置';

    if (user.mustChangeCredentials) {
      showFirstLoginModal.value = true;
    }
  } catch (error) {
    auth.logout();
    await router.replace('/login');
    return;
  }

  gsap.from('.sidebar', { x: -50, opacity: 0, duration: 0.8, ease: 'power3.out' });
  gsap.from('.ambient-glow-purple, .ambient-glow-blue', { opacity: 0, scale: 0.8, duration: 2, ease: 'power2.out' });
  animateViewIn();
});

function navClass(viewId) {
  return {
    active: activeView.value === viewId && activeView.value !== 'view-security'
  };
}

function switchView(targetId) {
  if (auth.mustChangeCredentials && targetId !== 'view-security' && !showFirstLoginModal.value) {
    activeView.value = 'view-security';
  } else {
    activeView.value = targetId;
  }

  nextTick(animateViewIn);
}

function animateViewIn() {
  gsap.fromTo(
    '.view-section.active .stagger-card',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.2)' }
  );
}

async function generateKeyPair() {
  if (isGenerating.value) {
    return;
  }

  isGenerating.value = true;
  downloadReady.value = false;
  generateText.value = '生成中...';

  try {
    const response = await fetch(apiUrl(`/keys/generate?alias=${encodeURIComponent(keyAlias.value || 'ou-ssh-generated-key')}`), {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    });

    if (!response.ok) {
      throw new Error('key_generation_failed');
    }

    const disposition = response.headers.get('Content-Disposition') || '';
    const filenameMatch = disposition.match(/filename="([^"]+)"/);
    const blob = await response.blob();

    if (zipObjectUrl.value) {
      URL.revokeObjectURL(zipObjectUrl.value);
    }

    zipObjectUrl.value = URL.createObjectURL(blob);
    zipFilename.value = filenameMatch ? filenameMatch[1] : 'ou-ssh-ed25519.zip';
    downloadReady.value = true;
    generateText.value = '生成完成';
  } catch (error) {
    generateText.value = '生成失败，请重试';
  } finally {
    isGenerating.value = false;
  }
}

function downloadGeneratedZip() {
  if (!downloadReady.value || !zipObjectUrl.value) {
    return;
  }

  const link = document.createElement('a');
  link.href = zipObjectUrl.value;
  link.download = zipFilename.value;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function copyScript() {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(scriptForCopy.value);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = scriptForCopy.value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1500);
}

function ackFirstLogin() {
  showFirstLoginModal.value = false;
  switchView('view-security');
}

function openSecuritySettings() {
  switchView('view-security');
}

async function loadGithubOAuthSettings() {
  try {
    const settings = await auth.getGithubOAuthSettings();
    githubOAuthConfigured.value = Boolean(settings.configured);
    githubOAuthForm.clientId = settings.clientId || '';
    githubOAuthForm.clientSecret = '';
    githubOAuthForm.callbackUrl = settings.callbackUrl || settings.defaultCallbackUrl || '';
    githubOAuthCreateUrl.value = settings.createUrl || 'https://github.com/settings/applications/new';
  } catch (error) {
    const status = await auth.getGithubOAuthStatus();
    githubOAuthConfigured.value = Boolean(status.configured);
    githubOAuthForm.callbackUrl = status.callbackUrl || '';
  }
}

async function saveSecuritySettings() {
  if (securityForm.newPassword !== securityForm.confirmPassword) {
    saveText.value = '两次密码不一致';
    return;
  }

  saveText.value = '保存中...';

  try {
    const user = await auth.updateProfile({
      username: securityForm.username,
      currentPassword: securityForm.currentPassword,
      newPassword: securityForm.newPassword
    });

    securityForm.username = user.username;
    securityForm.currentPassword = '';
    securityForm.newPassword = '';
    securityForm.confirmPassword = '';
    saveText.value = '已保存';
  } catch (error) {
    const messages = {
      current_password_invalid: '当前密码错误',
      new_password_required: '请输入新密码',
      password_too_short: '密码至少 6 位',
      username_required: '请输入账号',
      username_exists: '账号已存在'
    };
    saveText.value = messages[error.message] || '保存失败';
  }
}

async function copyGithubCallbackUrl() {
  const callbackUrl = githubOAuthForm.callbackUrl;

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(callbackUrl);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = callbackUrl;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  callbackCopyText.value = '已复制';
  window.setTimeout(() => {
    callbackCopyText.value = '复制';
  }, 1500);
}

async function saveGithubOAuthSettings() {
  githubOAuthSaveText.value = '保存中...';

  try {
    const settings = await auth.updateGithubOAuthSettings({
      clientId: githubOAuthForm.clientId,
      clientSecret: githubOAuthForm.clientSecret,
      callbackUrl: githubOAuthForm.callbackUrl
    });
    githubOAuthConfigured.value = Boolean(settings.configured);
    githubOAuthForm.clientId = settings.clientId || '';
    githubOAuthForm.clientSecret = '';
    githubOAuthForm.callbackUrl = settings.callbackUrl || '';
    githubLinkText.value = auth.user?.githubLinked ? '已绑定 GitHub' : '绑定 GitHub 登录';
    githubOAuthSaveText.value = '已保存';
  } catch (error) {
    const messages = {
      change_credentials_required: '先完成安全设定',
      github_client_id_required: '缺少 Client ID',
      github_client_secret_required: '缺少 Client Secret',
      github_callback_url_required: '缺少回调地址',
      github_callback_url_invalid: '回调地址无效'
    };
    githubOAuthSaveText.value = messages[error.message] || '保存失败';
  }
}

async function bindGithubLogin() {
  githubLinkText.value = '正在跳转...';

  try {
    const data = await auth.createGithubLink();
    window.location.href = data.url;
  } catch (error) {
    const messages = {
      change_credentials_required: '请先完成安全设定',
      github_oauth_not_configured: 'GitHub 未配置'
    };
    githubLinkText.value = messages[error.message] || '绑定失败';
  }
}
</script>
