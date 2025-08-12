# Auto commit & push script for a Git repo
$repoPath = "C:\Users\sidcr\OneDrive\Documents\GitHub\blog"
$commitMessage = "Auto-commit from OneDrive"

Set-Location $repoPath

# Watch for changes
while ($true) {
    # Check if there are changes
    $status = git status --porcelain
    if ($status) {
        git add .
        git commit -m "$commitMessage - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git push
    }
    Start-Sleep -Seconds 10  # check every 10 seconds
}
