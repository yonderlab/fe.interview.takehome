# Steps done

## 1. Run format script to commit formatted code

## 2. Install Husky:

Cursor > Composer > Prompt: "Install husky and create a pre-push hook to execute the following scripts: format, lint, check-types, test and build (in this order)."

Reason: replaces temporarely the need of a CI flow (like GHA)

## 3. Create NextJS application:

Cursor > Composer > Prompt "Create a Nextjs application inside /apps folder and with typescript and tailwind"

Command executed:
npx create-next-app@latest web --typescript --tailwind --no-eslint --app --no-src-dir --import-alias "@/\*"
