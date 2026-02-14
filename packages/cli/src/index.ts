import { CodeGenerator } from '@wxtools/templates';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * CLI command interface
 */
export interface Command {
  name: string;
  description: string;
  execute(args: string[]): Promise<void>;
}

/**
 * Generate module command
 */
export class GenerateModuleCommand implements Command {
  name = 'generate:module';
  description = 'Generate a new module';

  async execute(args: string[]): Promise<void> {
    const [moduleName] = args;

    if (!moduleName) {
      console.error('Usage: wxtools generate:module <name>');
      process.exit(1);
    }

    const generator = new CodeGenerator();
    const className = this.toPascalCase(moduleName);
    const id = this.toKebabCase(moduleName);

    const code = generator.generateModule({
      name: moduleName,
      className,
      id,
      version: '0.1.0',
    });

    const outputPath = path.join(process.cwd(), 'src', 'modules', `${id}.ts`);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, code, 'utf-8');

    console.log(`✓ Generated module at ${outputPath}`);
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, (c) => c.toUpperCase());
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
}

/**
 * Generate background script command
 */
export class GenerateBackgroundCommand implements Command {
  name = 'generate:background';
  description = 'Generate background script';

  async execute(args: string[]): Promise<void> {
    const packageJson = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
    );

    const generator = new CodeGenerator();
    const code = generator.generateBackground({
      name: packageJson.name || 'WXT Extension',
      modules: args,
    });

    const outputPath = path.join(process.cwd(), 'src', 'background.ts');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, code, 'utf-8');

    console.log(`✓ Generated background script at ${outputPath}`);
  }
}

/**
 * Init project command
 */
export class InitCommand implements Command {
  name = 'init';
  description = 'Initialize a new WXT extension project';

  async execute(args: string[]): Promise<void> {
    const [projectName = 'my-extension'] = args;
    const projectPath = path.join(process.cwd(), projectName);

    console.log(`Creating new WXT extension: ${projectName}`);

    // Create directory structure
    await fs.mkdir(projectPath, { recursive: true });
    await fs.mkdir(path.join(projectPath, 'src', 'modules'), { recursive: true });
    await fs.mkdir(path.join(projectPath, 'public'), { recursive: true });

    // Create package.json
    const packageJson = {
      name: projectName,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'wxt',
        build: 'wxt build',
      },
      dependencies: {
        '@wxtools/app': 'workspace:*',
        '@wxtools/core': 'workspace:*',
        '@wxtools/rpc': 'workspace:*',
        '@wxtools/settings': 'workspace:*',
      },
      devDependencies: {
        '@wxtools/cli': 'workspace:*',
        wxt: '^0.17.0',
        typescript: '^5.3.3',
      },
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf-8'
    );

    // Create manifest
    const manifest = {
      name: projectName,
      version: '0.1.0',
      manifest_version: 3,
      description: 'A WXT browser extension',
      permissions: ['storage'],
    };

    await fs.writeFile(
      path.join(projectPath, 'public', 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    // Create README
    const readme = `# ${projectName}

A WXT browser extension built with @wxtools.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`
`;

    await fs.writeFile(path.join(projectPath, 'README.md'), readme, 'utf-8');

    console.log(`✓ Created project at ${projectPath}`);
    console.log('\nNext steps:');
    console.log(`  cd ${projectName}`);
    console.log('  npm install');
    console.log('  npm run dev');
  }
}

/**
 * CLI application
 */
export class CLI {
  private commands = new Map<string, Command>();

  constructor() {
    this.registerCommand(new InitCommand());
    this.registerCommand(new GenerateModuleCommand());
    this.registerCommand(new GenerateBackgroundCommand());
  }

  registerCommand(command: Command): void {
    this.commands.set(command.name, command);
  }

  async run(args: string[]): Promise<void> {
    const [commandName, ...commandArgs] = args;

    if (!commandName || commandName === 'help' || commandName === '--help') {
      this.showHelp();
      return;
    }

    const command = this.commands.get(commandName);

    if (!command) {
      console.error(`Unknown command: ${commandName}`);
      this.showHelp();
      process.exit(1);
    }

    try {
      await command.execute(commandArgs);
    } catch (error) {
      console.error('Error executing command:', error);
      process.exit(1);
    }
  }

  private showHelp(): void {
    console.log('wxtools - WXT browser extension toolkit\n');
    console.log('Usage: wxtools <command> [options]\n');
    console.log('Commands:');

    for (const command of this.commands.values()) {
      console.log(`  ${command.name.padEnd(25)} ${command.description}`);
    }

    console.log('\nRun "wxtools <command> --help" for more information on a command.');
  }
}
