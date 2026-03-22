name: Build Android APK

on:
  workflow_dispatch:
    inputs:
      site_url:
        description: 'Deine Netlify URL (z.B. https://todo-pro.netlify.app)'
        required: true
        default: 'https://todo-pro.netlify.app'

jobs:
  build-apk:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install PWABuilder CLI
        run: npm install -g @pwabuilder/cli

      - name: Setup Java (für Android Build)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Build APK with PWABuilder
        run: |
          mkdir -p output
          pwabuilder build android \
            --url "${{ github.event.inputs.site_url }}" \
            --output ./output \
            --signingMode none
        continue-on-error: true

      - name: Fallback – Bubblewrap APK
        if: failure()
        run: |
          npm install -g @bubblewrap/cli
          mkdir -p twa-output && cd twa-output
          
          # Bubblewrap init mit deinen App-Daten
          bubblewrap init \
            --manifest "${{ github.event.inputs.site_url }}/manifest.json" \
            --directory .

          # Unsigned APK bauen (kein Keystore nötig für Test)
          bubblewrap build --skipPwaValidation

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: TodoPro-APK
          path: |
            output/**/*.apk
            twa-output/**/*.apk
          if-no-files-found: warn
          retention-days: 30
