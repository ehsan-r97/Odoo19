# 📘 Odoo 19 Full‑Stack Installation on WSL2 Ubuntu 24.04

This guide sets up **Odoo 19** with **PostgreSQL 16**, **Nginx**, **Iranian mirrors**, a custom **Zsh** environment, and all AI‑readiness requirements (pgvector) on **Windows 10/11 WSL2**.

All credentials and paths are pre‑configured:

- Ubuntu username: `odoo19`
- Project directory: `/home/odoo19/odoo19`
- PostgreSQL user: `odoo19`  
  Passwords: **`999239`**
- Odoo port: **8019** (internal)  
  Nginx listens on port **80** → `http://localhost`

The repository is cloned from `https://gitlab.chabokan.net/ehsan.r97/odoo19.git` and already contains `custom_addons`, `filestore`, `logs`, `backups` and a pre‑configured `odoo.conf` with `http_port = 8019`, as well as a convenient startup script `start_odoo.sh`.

---

## 1. System Update & Iranian Mirrors

### Optional – Iranian APT mirror

If your internet is restricted, replace the default repositories:

```bash
sudo cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak
sudo tee /etc/apt/sources.list.d/ubuntu.sources > /dev/null <<'EOF'
Types: deb deb-src
URIs: https://mirror.mobinhost.com/ubuntu/
Suites: noble noble-updates noble-backports
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb deb-src
URIs: https://mirror.mobinhost.com/ubuntu/
Suites: noble-security
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
EOF
sudo apt update
```

### Upgrade & install base tools

```bash
sudo apt upgrade -y
sudo apt install -y build-essential git wget curl rsync
```

(`rsync` is required for PyCharm WSL integration.)

---

## 2. Install & Configure PostgreSQL 16

```bash
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

Create the database user:

```bash
sudo -i -u postgres
createuser odoo19 --createdb --pwprompt
# password: 999239 (enter twice)
psql -c "ALTER USER odoo19 WITH SUPERUSER;"
psql -c "ALTER USER postgres WITH PASSWORD '999239';"
exit
```

Verify:

```bash
sudo service postgresql status   # should show "online"
```

---

## 3. Install System Packages for Odoo

```bash
sudo apt install -y \
    python3.12 python3.12-dev python3.12-venv python3-pip \
    libxml2-dev libxslt1-dev libldap2-dev libsasl2-dev \
    libssl-dev libjpeg-dev libjpeg8-dev libpq-dev \
    libffi-dev libfreetype6-dev liblcms2-dev libblas-dev libatlas-base-dev \
    libtiff5-dev libwebp-dev libharfbuzz-dev libfribidi-dev \
    libxcb1-dev zlib1g-dev libzip-dev \
    nodejs npm node-less \
    xfonts-75dpi xfonts-base \
    wkhtmltopdf
```

---

## 4. Iranian npm Mirror & Global Packages

```bash
npm config set registry https://mirror2.chabokan.net/npm/
sudo npm install -g less less-plugin-clean-css rtlcss
npm config delete registry   # optional, restore default
```

---

## 5. Verify wkhtmltopdf

Yenthe’s script checks symlinks – we do the same:

```bash
if [ -x /usr/local/bin/wkhtmltopdf ] && ! command -v wkhtmltopdf >/dev/null 2>&1; then
    sudo ln -s /usr/local/bin/wkhtmltopdf /usr/bin || true
fi
if [ -x /usr/local/bin/wkhtmltoimage ] && ! command -v wkhtmltoimage >/dev/null 2>&1; then
    sudo ln -s /usr/local/bin/wkhtmltoimage /usr/bin || true
fi
```

Confirm: `wkhtmltopdf --version`

---

## 6. Install Zsh & EhsanDEV Terminal

```bash
sudo apt install -y zsh figlet toilet fortune-mod cowsay lolcat neofetch
sudo apt install -y bat eza tree htop ncdu
sudo apt install -y zsh-syntax-highlighting zsh-autosuggestions
sudo apt install -y ripgrep fd-find fzf

chsh -s $(which zsh)
```

Create `~/.zshrc` with the EhsanDEV configuration below, then launch `zsh`.

<details>
<summary>Click to expand EhsanDEV .zshrc</summary>

```bash
# ╔══════════════════════════════════════════════════════════╗
# ║                                                          ║
# ║  ███████╗██╗  ██╗███████╗ █████╗ ███╗   ██╗██████╗ ████
# ║  ██╔════╝██║  ██║██╔════╝██╔══██╗████╗  ██║██╔══██╗██╔══╝
# ║  █████╗  ███████║█████╗  ███████║██╔██╗ ██║██║  ██║█████╗
# ║  ██╔══╝  ██╔══██║██╔══╝  ██╔══██║██║╚██╗██║██║  ██║██╔══╝
# ║  ██║     ██║  ██║███████╗██║  ██║██║ ╚████║██████╔╝██████╗
# ║  ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═════╝
# ║                                                          ║
# ╚══════════════════════════════════════════════════════════╝

# ===== 🌟 EhsanDEV INITIALIZATION =====
autoload -U colors && colors
export TERM=xterm-256color

# ===== 🎭 ROBUST WELCOME SCREEN =====
welcome_message() {
    clear
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                    EhsanDEV Terminal                    ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    
    if command -v toilet &> /dev/null; then
        date "+%A, %B %d %Y | %I:%M:%S %p" | toilet -f term -F border --gay
    else
        echo "┌────────────────────────────────────────────┐"
        echo "│ $(date '+%A, %B %d %Y | %I:%M:%S %p') │"
        echo "└────────────────────────────────────────────┘"
    fi
    
    echo ""
    echo "🚀 Welcome to the ultimate terminal experience!"
    echo "💡 Type 'ehsanhelp' for all available commands"
    echo ""
}

if [[ -z "$EHSANDEV_LOADED" ]]; then
    welcome_message
    export EHSANDEV_LOADED=1
fi

# ===== 🎨 DYNAMIC COLOR PROMPT =====
PROMPT_THEME=2

set_prompt() {
    case $PROMPT_THEME in
        1)
            PROMPT="%F{blue}┌─%f%F{white}[%f%F{cyan}%n%f%F{white}@%f%F{green}%m%f%F{white}]%f%F{blue}─[%f%F{yellow}%~%f%F{blue}]%f"$'\n'"%F{blue}└─%f%F{white}➜%f "
            RPROMPT="%F{cyan}🕐 %*%f"
            ;;
        2)
            PROMPT="%F{red}╭─%f%F{yellow}[%f%F{green}%n%f%F{yellow}@%f%F{magenta}%m%f%F{yellow}]%f%F{red}─[%f%F{cyan}%~%f%F{red}]%f"$'\n'"%F{red}╰─%f%F{white}✦%f "
            RPROMPT="%F{magenta}⏰ %*%f"
            ;;
        3)
            PROMPT="%F{242}%n@%m:%f%F{blue}%~%f %F{white}❯%f "
            RPROMPT="%F{245}[%*]%f"
            ;;
        4)
            PROMPT="%F{240}┌─%f%F{245}[%f%F{250}%n%f%F{245}@%f%F{253}%m%f%F{245}]%f%F{240}─[%f%F{248}%~%f%F{240}]%f"$'\n'"%F{240}└─%f%F{white}▶%f "
            RPROMPT="%F{244}⌚ %*%f"
            ;;
    esac
}

set_prompt

function prompt-theme() {
    if [[ "$1" =~ ^[1-4]$ ]]; then
        PROMPT_THEME=$1
        set_prompt
        echo "Theme changed to $1"
    else
        echo "Available themes:"
        echo "  1 - Professional Blue"
        echo "  2 - Vibrant Rainbow"
        echo "  3 - Minimal Gray"
        echo "  4 - Dark Theme"
        echo "Usage: prompt-theme <1-4>"
    fi
}

# ===== ⚡ TERMINAL TITLE =====
case $TERM in
    xterm*|rxvt*|alacritty*|kitty*)
        precmd() { print -Pn "\e]0;EhsanDEV :: %n @ %m :: %~\a" }
        preexec() { print -Pn "\e]0;EhsanDEV :: $1 :: %~\a" }
        ;;
esac

# ===== 🎨 SYNTAX HIGHLIGHTING =====
if [[ -f /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh ]]; then
    source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
    ZSH_HIGHLIGHT_STYLES[default]='fg=cyan'
    ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=red,bold'
    ZSH_HIGHLIGHT_STYLES[reserved-word]='fg=magenta,bold'
    ZSH_HIGHLIGHT_STYLES[alias]='fg=green,bold'
    ZSH_HIGHLIGHT_STYLES[builtin]='fg=yellow,bold'
    ZSH_HIGHLIGHT_STYLES[function]='fg=blue,bold'
    ZSH_HIGHLIGHT_STYLES[command]='fg=green'
    ZSH_HIGHLIGHT_STYLES[precommand]='fg=green,underline'
    ZSH_HIGHLIGHT_STYLES[path]='fg=cyan,underline'
    ZSH_HIGHLIGHT_STYLES[globbing]='fg=red'
fi

# ===== 💭 AUTOSUGGESTIONS =====
if [[ -f /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh ]]; then
    source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh
    ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#555555"
    ZSH_AUTOSUGGEST_STRATEGY=(history completion)
    bindkey '^ ' autosuggest-accept
else
    bindkey '^R' history-incremental-search-backward
fi

# ===== 🎯 COMPLETION =====
autoload -Uz compinit
compinit -i
zstyle ':completion:*' menu select
zstyle ':completion:*' list-colors ${(s.:.)LS_COLORS}
zstyle ':completion:*' group-name ''
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'
zstyle ':completion:*' completer _expand _complete _ignored _approximate
zstyle ':completion:*' select-prompt '%SScrolling active: current selection at %p%s'

# ===== 🚀 ALIASES =====
alias ls='ls --color=auto -F'
alias ll='ls -la --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
alias grep='grep --color=auto'
alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'
alias diff='diff --color=auto'
alias ip='ip -color'

if command -v eza &> /dev/null; then
    alias ls='eza --icons --group-directories-first'
fi
if command -v bat &> /dev/null; then
    alias cat='bat --style=grid --theme=TwoDark'
fi
if command -v fd-find &> /dev/null; then
    alias find='fd-find'
elif command -v fdfind &> /dev/null; then
    alias find='fdfind'
fi
if command -v rg &> /dev/null; then
    alias rg='ripgrep'
fi

alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias ~='cd ~'
alias -- -='cd -'
alias c='clear'
alias cls='clear'

alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

alias df='df -h'
alias du='du -h'
alias free='free -h'
alias meminfo='free -m -l -t'
alias psmem='ps auxf | sort -nr -k 4 | head -20'
alias pscpu='ps auxf | sort -nr -k 3 | head -20'

alias ports='netstat -tulanp'
alias myip='curl -s ifconfig.me'
alias ping='ping -c 5'

alias g='git'
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gd='git diff'
alias gl='git log --oneline --graph --decorate --all'
alias gp='git push'
alias gpl='git pull'

if command -v lolcat &> /dev/null; then
    alias rainbow='echo "🌈 RAINBOW MODE ACTIVATED 🌈" | lolcat'
    alias colorize='lolcat'
else
    alias rainbow='echo "🌈 RAINBOW MODE ACTIVATED 🌈"'
    alias colorize='cat'
fi
if command -v neofetch &> /dev/null; then
    alias sysinfo='neofetch --ascii_distro ubuntu'
else
    alias sysinfo='echo "System: $(uname -a)"'
fi

alias h='history'
alias path='echo -e ${PATH//:/\\n}'
alias now='date +"%T"'
alias nowdate='date +"%d-%m-%Y"'
alias extract='tar -xvf'
alias compress='tar -czvf'
alias sizes='du -sh * | sort -hr'
alias findbig='find . -type f -size +100M -exec ls -lh {} \;'

# ===== 🎮 FUNCTIONS =====
function listdir() {
    if command -v eza &> /dev/null; then
        eza --icons --long --all --group-directories-first "$@"
    else
        ls -la --color=always "$@" | awk '
            BEGIN {
                color["d"]="\033[1;34m"
                color["l"]="\033[1;36m"
                color["-"]="\033[1;37m"
                reset="\033[0m"
            }
            NR==1 {print}
            NR>1 {
                type=substr($1,1,1)
                $1=color[type] $1 reset
                print
            }
        '
    fi
}

function recho() {
    if command -v lolcat &> /dev/null; then
        echo "$@" | lolcat
    else
        echo "$@"
    fi
}

function ehsanhelp() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                 EhsanDEV Terminal Help                  ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "🎨 THEME CONTROL:"
    echo "  prompt-theme 1    Professional Blue"
    echo "  prompt-theme 2    Vibrant Rainbow"
    echo "  prompt-theme 3    Minimal Gray"
    echo "  prompt-theme 4    Dark Theme"
    echo ""
    echo "📁 NAVIGATION:"
    echo "  listdir          Colorful directory listing"
    echo "  .. / ...         Quick navigation"
    echo "  sizes            Show folder sizes"
    echo "  findbig          Find large files"
    echo ""
    echo "🎭 FUN COMMANDS:"
    echo "  recho <text>     Rainbow colored text"
    echo "  rainbow          Rainbow display"
    echo "  banner <text>    ASCII banner"
    echo "  sysinfo          System information"
    echo ""
    echo "⚡ SYSTEM:"
    echo "  meminfo          Memory info"
    echo "  psmem / pscpu    Process monitoring"
    echo "  myip             Public IP"
    echo "  ports            Open ports"
    echo ""
    echo "🔧 DEVELOPMENT:"
    echo "  gs / ga / gc     Git shortcuts"
    echo "  extract / compress Tar operations"
    echo ""
    echo "💡 TIPS:"
    echo "  • Use Ctrl+R for history search"
    echo "  • Tab completion is enhanced"
    echo "  • Right side shows current time"
    echo ""
}

function greet() {
    echo ""
    if command -v figlet &> /dev/null; then
        figlet "Welcome $USER!" 2>/dev/null || echo "Welcome $USER!"
    else
        echo "┌─────────────────┐"
        echo "│ Welcome $USER! │"
        echo "└─────────────────┘"
    fi
    if command -v cowsay &> /dev/null && command -v fortune &> /dev/null; then
        fortune -s | cowsay -f tux 2>/dev/null || echo "Have an awesome day!"
    else
        echo "✨ Have an awesome day! ✨"
    fi
    echo ""
}

function search() {
    if [[ -z "$1" ]]; then
        echo "Usage: search <pattern>"
        return
    fi
    grep -r "$1" . --color=auto
}

function sizegraph() {
    du -sh * | sort -hr | awk '
        BEGIN {
            print "╔══════════════════════════════════════════╗"
            print "║          Directory Size Chart           ║"
            print "╚══════════════════════════════════════════╝"
            print ""
        }
        {
            size=$1
            name=$2
            printf "%-40s %10s\n", name, size
        }
    '
}

function quickhist() {
    history | tail -30 | awk '{ printf "%5d  %s\n", $1, substr($0, index($0,$2)) }'
}

# ===== ⌨️ KEY BINDINGS =====
bindkey -e
bindkey '^[[A' history-beginning-search-backward
bindkey '^[[B' history-beginning-search-forward
bindkey '^R' history-incremental-search-backward
bindkey '^T' history-incremental-search-forward
bindkey '^U' backward-kill-line
bindkey '^W' backward-kill-word
bindkey '^Y' yank
bindkey '^[[3~' delete-char

# ===== 📜 HISTORY =====
HISTSIZE=1000000
SAVEHIST=1000000
HISTFILE=~/.zsh_history
setopt append_history
setopt extended_history
setopt hist_expire_dups_first
setopt hist_ignore_dups
setopt hist_ignore_space
setopt hist_verify
setopt inc_append_history
setopt share_history

# ===== 🌍 ENVIRONMENT =====
export EDITOR=nano
export VISUAL=nano
export PAGER=less
export LESS='-R -i -j5'
export PATH="$HOME/.local/bin:$PATH"
export LS_COLORS='di=34:ln=35:so=32:pi=33:ex=31:bd=34;46:cd=34;43:su=30;41:sg=30;46:tw=30;42:ow=30;43'

# ===== 🚀 FINAL SETUP =====
echo ""
echo "🎨 EhsanDEV Terminal Ready!"
echo "💡 Type 'ehsanhelp' for command guide"
echo "✨ Current theme: $PROMPT_THEME (change with 'prompt-theme')"
echo ""
```

</details>

---

## 7. Clone Your Odoo Repository

```bash
cd ~
git clone https://gitlab.chabokan.net/ehsan.r97/odoo19.git
cd odoo19
```

The repository already contains a `start_odoo.sh` script (see step 13).

---

## 8. Python Virtual Environment & Dependencies

### Iranian pip mirror (optional)

```bash
export PIP_INDEX_URL=https://mirror2.chabokan.net/pypi/simple/
```

### Setup

```bash
python3.12 -m venv venv
source venv/bin/activate

pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

If `openpyxl==3.1.2` fails:

```bash
pip install openpyxl==3.1.5
pip install -r requirements.txt
```

### Extra: phonenumbers (required for phone validation)

```bash
pip install phonenumbers
```

You can now unset the mirror: `unset PIP_INDEX_URL`

---

## 9. Make `odoo-bin` Executable & Verify Folders

```bash
chmod +x odoo-bin
mkdir -p custom_addons filestore logs backups
```

Also ensure the startup script is executable (it should be already from the repo):

```bash
chmod +x start_odoo.sh
```

---

## 10. PostgreSQL AI Readiness (pgvector)

For Odoo 19 AI features (RAG / vector search), you must enable the **vector** extension.

### Install pgvector package

```bash
sudo apt install -y postgresql-16-pgvector
```

### Enable the extension on your Odoo database

Make sure PostgreSQL is running, then:

```bash
sudo -u postgres psql
```

Inside the PostgreSQL prompt:

```sql
\c odoo19          -- or your actual database name
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

Restart Odoo after this change. The AI module will now install without the RAG‑related error.

---

## 11. Install & Configure Nginx

### Install

```bash
sudo apt install -y nginx
```

### Create Nginx site configuration

```bash
sudo nano /etc/nginx/sites-available/odoo
```

Paste the following production‑ready configuration (adapted from the Yenthe script):

```nginx
upstream odoo {
    server 127.0.0.1:8019;
}

upstream odoochat {
    server 127.0.0.1:8019;   # longpolling (same for now)
}

server {
    listen 80;
    server_name _;

    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    proxy_set_header X-Client-IP $remote_addr;

    access_log /var/log/nginx/odoo-access.log;
    error_log  /var/log/nginx/odoo-error.log;

    proxy_buffers 16 64k;
    proxy_buffer_size 128k;
    proxy_read_timeout 900s;
    proxy_connect_timeout 900s;
    proxy_send_timeout 900s;
    proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;

    client_max_body_size 0;

    gzip on;
    gzip_min_length 1100;
    gzip_buffers 4 32k;
    gzip_types text/css text/less text/plain text/xml application/xml application/json application/javascript application/pdf image/jpeg image/png;
    gzip_vary on;

    location / {
        proxy_pass http://odoo;
        proxy_redirect off;
    }

    location /longpolling {
        proxy_pass http://odoochat;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 2d;
        proxy_pass http://odoo;
        add_header Cache-Control "public, no-transform";
    }

    location ~ /[a-zA-Z0-9_-]*/static/ {
        proxy_cache_valid 200 302 60m;
        proxy_cache_valid 404 1m;
        proxy_buffering on;
        expires 864000;
        proxy_pass http://odoo;
    }
}
```

### Enable site & restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/odoo /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default   # remove default welcome page
sudo nginx -t
sudo service nginx reload
```

---

## 12. Enable Odoo Proxy Mode

Add this line to `~/odoo19/odoo.conf` under `[options]`:

```ini
proxy_mode = True
```

(If the file already contains it, no change needed.)

---

## 13. Start Odoo (using the convenience script)

Your repository contains `start_odoo.sh` which already:

- Changes to the project directory.
- Activates the virtual environment.
- Checks if PostgreSQL is running (starts it if necessary).
- Launches Odoo with console logging (`--log-handler=:INFO`) and your `odoo.conf`.

To start Odoo, simply run:

```bash
cd ~/odoo19
./start_odoo.sh
```

You can also pass additional Odoo arguments, e.g.:

```bash
./start_odoo.sh --log-level=debug
```

Once you see `HTTP service (werkzeug) running on 0.0.0.0:8019`, Odoo is ready.

**Note:** The first time you run the script, it may prompt for your password to start PostgreSQL (if it wasn’t running). This is normal.

---

## 14. Access Odoo

- Via Nginx (recommended): **`http://localhost`**
- Directly (bypassing Nginx): **`http://localhost:8019`**

Database creation form:
- Master Password: `999239`
- Database Name: any
- Email: `admin@example.com`
- Password: `admin`

---

## 🔁 WSL2-Specific Notes

- PostgreSQL and Nginx do **not** start automatically after a reboot. The `start_odoo.sh` script starts PostgreSQL for you if it’s not running, but you still need to start Nginx manually:
  ```bash
  sudo service nginx start
  ```
- To stop Odoo, press `Ctrl+C` in its terminal.
- Never run Odoo with `sudo`.

---

## 🧪 Verification

| Check | Command / Action |
|-------|------------------|
| PostgreSQL running | `sudo service postgresql status` |
| Nginx running | `sudo service nginx status` |
| Odoo accessible directly | `curl -I http://localhost:8019` → 200 |
| Odoo via Nginx | Open `http://localhost` in browser |
| wkhtmltopdf works | `wkhtmltopdf --version` |
| phonenumbers installed | `pip show phonenumbers` |
| pgvector enabled | `sudo -u postgres psql -d odoo19 -c "SELECT * FROM pg_extension WHERE extname='vector';"` should return a row |
