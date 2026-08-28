# ============================================================
# ZAIKA - BUILD & PUSH ALL BACKEND DOCKER IMAGES
# ============================================================

$ErrorActionPreference = "Stop"

# ------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------

$DOCKER_USERNAME = "anmol1885"
$TAG = "latest"

# ------------------------------------------------------------
# SERVICES
# ------------------------------------------------------------

$apps = @(
    @{
        Name = "admin"
        Path = ".\services\admin"
        Image = "updated-anmol-admin"
    },
    @{
        Name = "auth"
        Path = ".\services\auth"
        Image = "updated-anmol-auth"
    },
    @{
        Name = "realtime"
        Path = ".\services\realtime"
        Image = "updated-anmol-realtime"
    },
    @{
        Name = "restaurant"
        Path = ".\services\restaurant"
        Image = "updated-anmol-restaurant"
    },
    @{
        Name = "rider"
        Path = ".\services\rider"
        Image = "updated-anmol-rider"
    },
    @{
        Name = "utils"
        Path = ".\services\utils"
        Image = "updated-anmol-utils"
    }
)

# ------------------------------------------------------------
# CHECK DOCKER
# ------------------------------------------------------------

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "      ZAIKA BACKEND DOCKER DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking Docker..." -ForegroundColor Yellow

docker --version

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not installed or not running." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# DOCKER HUB LOGIN
# ------------------------------------------------------------

Write-Host ""
Write-Host "Checking Docker Hub login..." -ForegroundColor Yellow

docker login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Hub login failed." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------
# BUILD + PUSH
# ------------------------------------------------------------

foreach ($app in $apps) {

    $name = $app.Name
    $path = $app.Path
    $image = $app.Image
    $dockerfile = Join-Path $path "Dockerfile"

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Processing: $name" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    # Check directory

    if (!(Test-Path $path)) {
        Write-Host "Directory does not exist: $path" -ForegroundColor Red
        exit 1
    }

    # Check Dockerfile

    if (!(Test-Path $dockerfile)) {
        Write-Host ""
        Write-Host "Dockerfile missing for: $name" -ForegroundColor Red
        Write-Host "Expected: $dockerfile" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }

    # Full Docker Hub image name

    $fullImage = "${DOCKER_USERNAME}/${image}:${TAG}"

    Write-Host ""
    Write-Host "Building image:" -ForegroundColor Yellow
    Write-Host "$fullImage" -ForegroundColor Green

    # Build

    docker build `
        -t $fullImage `
        $path

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker build failed for $name" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "Build successful: $name" -ForegroundColor Green

    # Push

    Write-Host ""
    Write-Host "Pushing $fullImage ..." -ForegroundColor Yellow

    docker push $fullImage

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker push failed for $name" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "Successfully pushed: $fullImage" -ForegroundColor Green
}

# ------------------------------------------------------------
# COMPLETE
# ------------------------------------------------------------

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "     ALL BACKEND IMAGES PUSHED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Docker Hub Images:" -ForegroundColor Cyan

foreach ($app in $apps) {
    Write-Host "${DOCKER_USERNAME}/$($app.Image):$TAG" -ForegroundColor Green
}

Write-Host ""
Write-Host "You can now deploy these images." -ForegroundColor Green
Write-Host ""