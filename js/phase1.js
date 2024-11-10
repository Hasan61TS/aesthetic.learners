class TerminalSimulator {
    constructor() {
        this.currentDir = '/home/user';
        this.previousDir = '';
        this.fileSystem = {
            '/': {
                'home': {
                    'user': {
                        'Documents': {},
                        'Downloads': {},
                        'Pictures': {},
                        'Desktop': {},
                        'test': {}
                    }
                },
                'etc': {},
                'usr': {
                    'bin': {},
                    'local': {},
                    'share': {}
                },
                'var': {
                    'log': {},
                    'tmp': {}
                },
                'tmp': {}
            }
        };
        this.filePermissions = {};
    }

    processCommand(command) {
        const args = command.trim().split(' ');
        const cmd = args[0].toLowerCase();
        
        switch(cmd) {
            case 'ls':
                return this.listDirectory(args.includes('-l'), args.find(arg => !arg.startsWith('-') && arg !== 'ls'));
            
            case 'cd':
                return this.changeDirectory(args[1] || '~');
            
            case 'chmod':
                return this.changePermissions(args[1], args[2]);
            
            case 'chown':
                return this.changeOwnership(args[1], args[2]);
            
            case 'chgrp':
                return this.changeGroup(args[1], args[2]);
            
            case 'whoami':
                return 'user';
            
            case 'pwd':
                return this.currentDir;
            
            case 'mkdir':
                return this.makeDirectory(args[1]);
            
            case 'touch':
                return this.createFile(args[1]);
            
            case 'rm':
                return this.removeFile(args[1]);
            
            case 'cp':
                return this.copyFile(args[1], args[2]);
            
            case 'clear':
                document.querySelector('.command-history').innerHTML = '';
                return '';
            
            case 'help':
                return this.showHelp();
            
            case 'apt':
                if (!args[1]) return 'apt: no command specified';
                switch(args[1]) {
                    case 'update':
                        return 'Reading package lists... Done';
                    case 'upgrade':
                        return 'Reading package lists... Done\nCalculating upgrade... Done\n0 upgraded, 0 newly installed';
                    case 'install':
                        if (!args[2]) return 'apt install: no package specified';
                        return `Reading package lists... Done\nInstalling ${args[2]}...`;
                    case 'remove':
                        if (!args[2]) return 'apt remove: no package specified';
                        return `Reading package lists... Done\nRemoving ${args[2]}...`;
                    case 'search':
                        if (!args[2]) return 'apt search: no search term specified';
                        return `Searching... Done\nFound packages matching '${args[2]}':\nnmap - Network exploration tool and security scanner\nzenmmap - GUI for nmap`;
                    case 'purge':
                        if (!args[2]) return 'apt purge: no package specified';
                        return `Reading package lists... Done\nPurging ${args[2]}...`;
                    default:
                        return `apt: invalid operation '${args[1]}'`;
                }
            
            case 'nano':
                if (!args[1]) return 'nano: no file specified';
                return `Opening nano editor...\nUse ^X to exit, ^O to save\n[Simulated nano editor for ${args[1]}]`;
            
            case 'vim':
                if (!args[1]) return 'vim: no file specified';
                return `Opening vim...\nType :q to exit\n[Simulated vim editor for ${args[1]}]`;
            
            default:
                return `Command '${cmd}' not found. Type 'help' for available commands.`;
        }
    }

    changePermissions(mode, target) {
        if (!mode || !target) return 'chmod: missing operand';
        
        const current = this.getDirectoryContents(this.currentDir);
        if (!current[target]) return `chmod: cannot access '${target}': No such file or directory`;

        // Initialize permissions if they don't exist
        if (!this.filePermissions[target]) {
            this.filePermissions[target] = '644';  // Default permission
        }

        if (mode.startsWith('+') || mode.startsWith('-')) {
            // Symbolic mode
            const operation = mode[0];
            const permission = mode.slice(1);
            // Simulate permission change
            return `Changed permissions of '${target}'`;
        } else {
            // Numeric mode
            this.filePermissions[target] = mode;
            return `Changed permissions of '${target}' to ${mode}`;
        }
    }

    changeOwnership(user, target) {
        if (!user || !target) return 'chown: missing operand';
        return `Changed ownership of '${target}' to ${user}`;
    }

    changeGroup(group, target) {
        if (!group || !target) return 'chgrp: missing operand';
        return `Changed group of '${target}' to ${group}`;
    }

    listDirectory(longFormat, targetPath) {
        const path = targetPath ? 
            (targetPath.startsWith('/') ? targetPath : `${this.currentDir}/${targetPath}`) : 
            this.currentDir;
        
        const contents = this.getDirectoryContents(path);
        if (!contents) return `ls: cannot access '${targetPath}': No such file or directory`;

        if (longFormat) {
            return Object.entries(contents).map(([name, content]) => {
                const isDir = typeof content === 'object';
                const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
                const owner = 'user';
                const group = 'user';
                const size = isDir ? 4096 : 0;
                const date = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                return `${perms} 1 ${owner} ${group} ${size} ${date} ${name}`;
            }).join('\n');
        }

        return Object.keys(contents).join('  ');
    }

    showHelp() {
        return `Available commands:
pwd - Show current directory
ls [-l] - List directory contents (with -l for long format)
cd - Change directory
mkdir - Create directory
touch - Create empty file
rm - Remove file
cp - Copy file
chmod - Change file permissions
chown - Change file owner
chgrp - Change file group
nano - Simple text editor
vim - Advanced text editor
apt - Package management
clear - Clear terminal
help - Show this help message`;
    }

    changeDirectory(path) {
        if (!path || path === '~' || path === '$HOME') {
            this.currentDir = '/home/user';
            return '';
        }

        let newPath;
        if (path === '/') {
            newPath = '/';
        } else if (path === '..') {
            const parts = this.currentDir.split('/').filter(p => p);
            parts.pop();
            newPath = parts.length ? '/' + parts.join('/') : '/';
        } else if (path === '-') {
            newPath = this.previousDir || this.currentDir;
        } else if (path.startsWith('/')) {
            newPath = path;
        } else {
            newPath = this.currentDir === '/' ? 
                '/' + path : 
                this.currentDir + '/' + path;
        }

        // Store current directory before changing
        this.previousDir = this.currentDir;

        // Verify the new path exists
        if (this.getDirectoryContents(newPath)) {
            this.currentDir = newPath;
            return '';
        }
        return `cd: no such directory: ${path}`;
    }

    getDirectoryContents(path) {
        if (!path) return null;
        
        // Handle root directory
        if (path === '/') return this.fileSystem['/'];

        // Split path into components and remove empty strings
        const parts = path.split('/').filter(p => p);
        
        let current = this.fileSystem['/'];
        for (const part of parts) {
            if (!current || !current[part]) return null;
            current = current[part];
        }
        
        return current;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const terminal = new TerminalSimulator();
    const cliInput = document.getElementById('cli-input');
    const commandHistory = document.querySelector('.command-history');

    if (cliInput) {
        cliInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const command = this.value.trim();
                
                // Add command to history
                const commandLine = document.createElement('div');
                commandLine.innerHTML = `<span class="prompt">user@linux:${terminal.currentDir}$</span> ${command}`;
                commandHistory.appendChild(commandLine);

                // Process command and show output
                const output = terminal.processCommand(command);
                if (output) {
                    const outputLine = document.createElement('div');
                    outputLine.className = 'command-output';
                    outputLine.textContent = output;
                    commandHistory.appendChild(outputLine);
                }

                // Clear input and scroll to bottom
                this.value = '';
                commandHistory.scrollTop = commandHistory.scrollHeight;
            }
        });
    }
}); 