# 🚀 DEPLOYMENT GUIDE FOR JOBWIN.PRO

## CURRENT SETUP
- **Frontend:** Vercel (auto-deploys from GitHub) ✅
- **Backend:** Need to confirm/update
- **Domain:** jobwin.pro
- **GitHub Repo:** mrmarch777/JobwinResume

---

## ⚡ STEP 1: FRONTEND DEPLOYMENT (Vercel)

### Since you already have auto-deploy from GitHub:

Vercel will automatically detect changes when you push to GitHub (already done ✅).

**To verify frontend is live:**
1. Go to https://vercel.com/dashboard
2. Click your "JobwinResume" project
3. You should see deployment `fe41b60` (the commit we just pushed)
4. Once it says "Ready" → your frontend is live at jobwin.pro

**Check Environment Variables on Vercel:**
```
NEXT_PUBLIC_API_URL = [your backend API URL]
```

If this is wrong or missing, frontend won't connect to backend. Update it now:
1. Project Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to your actual backend URL
3. Redeploy

---

## ⚠️ STEP 2: BACKEND DEPLOYMENT (Python/FastAPI)

### Option A: Render.com (Recommended)
```
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repo: mrmarch777/JobwinResume
4. Settings:
   - Name: jobwin-api
   - Runtime: Python 3
   - Build Command: pip install -r backend/requirements.txt
   - Start Command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
5. Environment Variables: (if needed for API keys, etc.)
   - ANTHROPIC_API_KEY
   - SERPAPI_KEY
6. Deploy!
7. Get your API URL: https://jobwin-api.onrender.com
```

### Option B: Railway.app
```
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repository
4. Add environment variables
5. Deploy and get URL
```

### Option C: Self-hosted VPS
```
SSH into your server and:
git clone https://github.com/mrmarch777/JobwinResume.git
cd JobwinResume/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🔗 STEP 3: CONNECT FRONTEND TO BACKEND

Once backend is deployed, you need to:

**On Vercel:**
1. Go to your project settings
2. Environment Variables
3. Set `NEXT_PUBLIC_API_URL` to your backend URL
   - If backend on Render: `https://jobwin-api.onrender.com`
   - If self-hosted: `https://api.jobwin.pro`
4. **Redeploy** (Vercel will automatically rebuild)

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify everything works:

- [ ] Frontend loads at jobwin.pro
- [ ] Theme switcher works (no console errors)
- [ ] Can navigate through pages
- [ ] ATS Optimizer page loads
- [ ] Try generating a resume (should connect to backend)
- [ ] Try a job search (should connect to backend)

**If features don't work:**
1. Open browser DevTools (F12) → Console
2. Check for errors mentioning API
3. Verify `NEXT_PUBLIC_API_URL` is correct
4. Restart Vercel deployment

---

## 📋 FILES CHANGED IN THIS UPDATE

✅ `backend/main.py` - Made API endpoints async
✅ `frontend/lib/contexts.js` - Dev mode enabled (all features unlocked)
✅ `frontend/pages/apply.js` - Enhanced cover letter generation
✅ `frontend/pages/resume.js` - New ATS Optimizer UI + Resume normalization
✅ `vercel.json` - Vercel configuration

---

## 🆘 TROUBLESHOOTING

### "Cannot GET /api/*"
- Backend is not running or URL is wrong
- Check `NEXT_PUBLIC_API_URL` on Vercel

### "CORS error"
- Backend CORS configuration needs to allow vercel.app domain
- In `backend/main.py`, check CORS settings

### Deployment stuck on Vercel
- Check build logs: Vercel dashboard → Deployments → click deployment
- Check if all dependencies are correct

### Backend won't start
```bash
# Test locally first
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

---

## 📞 NEXT STEPS

1. **Confirm** where backend should run (which option above?)
2. **Deploy** backend to chosen platform
3. **Update** `NEXT_PUBLIC_API_URL` on Vercel
4. **Verify** frontend connects to backend
5. **Test** key features (resume AI, job search, ATS score, etc.)

