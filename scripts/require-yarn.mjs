// Fails the install early when someone runs npm or pnpm by mistake.
const agent = process.env.npm_config_user_agent ?? "";

if (!agent.startsWith("yarn/")) {
  console.error("\nThis project uses Yarn only. Run `yarn install` instead.\n");
  process.exit(1);
}
