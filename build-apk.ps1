$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.13.21-hotspot"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
Write-Host "Java version:"
& java -version

Set-Location "c:\Users\PC\Downloads\game\vi-thang\android"
Write-Host "Running Gradle assembleDebug..."
& .\gradlew.bat assembleDebug
