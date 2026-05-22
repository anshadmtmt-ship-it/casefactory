import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../../router/AdminAuthContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password, rememberMe);
      navigate('/admin_panel/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        {/* Subtle grain */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="mb-10 text-center flex flex-col items-center">
            <svg
              viewBox="0 0 400 80"
              className="h-10 w-auto text-white filter drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] mb-2"
            >
              <path
                d="M30.4370 56.6170Q24.6950 56.6170 20.5770 54.6160Q16.4590 52.6150 13.8200 49.3380Q11.1810 46.0610 9.9630 42.2620Q8.7450 38.4630 8.7450 34.8670L8.7450 33.5910Q8.7450 29.6470 10.0210 25.7900Q11.2970 21.9330 13.9360 18.8010Q16.5750 15.6690 20.6060 13.7840Q24.6370 11.8990 30.1470 11.8990Q35.8890 11.8990 40.2680 14.0450Q44.6470 16.1910 47.2860 20.0190Q49.9250 23.8470 50.4470 28.8930L40.8770 28.8930Q40.2390 25.1230 37.3390 22.9480Q34.4390 20.7730 30.1470 20.7730Q24.4630 20.7730 21.4180 24.5140Q18.3730 28.2550 18.3730 34.2870Q18.3730 38.2890 19.7650 41.3340Q21.1570 44.3790 23.8540 46.0610Q26.5510 47.7430 30.4370 47.7430Q34.8450 47.7430 37.8900 45.5970Q40.9350 43.4510 41.5730 39.6810L51.0850 39.6810Q50.5630 44.3790 47.9820 48.2070Q45.4010 52.0350 40.9640 54.3260Q36.5270 56.6170 30.4370 56.6170M65.9330 56.3270Q60.7710 56.3270 57.6100 53.6590Q54.4490 50.9910 54.4490 46.1190Q54.4490 42.6390 56.2470 40.4060Q58.0450 38.1730 61.2930 37.1000Q64.5410 36.0270 68.7750 36.0270L74.5170 36.0270L74.5170 35.9110Q74.5170 31.0390 69.6450 31.0390Q68.3690 31.0390 66.2810 31.1260Q64.1930 31.2130 61.9600 31.3000Q59.7270 31.3870 57.9870 31.5030L57.9870 23.6730Q60.0170 23.4990 62.9750 23.3540Q65.9330 23.2090 68.4270 23.2090Q75.7350 23.2090 79.5920 26.3120Q83.4490 29.4150 83.4490 36.0270L83.4490 55.5150L76.0830 55.5150L76.0830 49.5410Q75.0390 52.8470 72.4870 54.5870Q69.9350 56.3270 65.9330 56.3270M68.7170 49.8890Q70.9790 49.8890 72.6610 48.6130Q74.3430 47.3370 74.5170 43.7410L74.5170 41.1890L68.7170 41.1890Q66.2810 41.1890 64.9760 42.4070Q63.6710 43.6250 63.6710 45.5970Q63.6710 47.5110 64.9760 48.7000Q66.2810 49.8890 68.7170 49.8890M103.4010 56.5010Q96.6150 56.5010 92.7870 53.7170Q88.9590 50.9330 88.7270 45.8870L96.9630 45.8870Q97.1370 47.3950 98.7610 48.5840Q100.3850 49.7730 103.5750 49.7730Q105.9530 49.7730 107.5770 48.9610Q109.2010 48.1490 109.2010 46.5250Q109.2010 45.1330 107.9830 44.2920Q106.7650 43.4510 103.6330 43.1030L101.1390 42.8710Q95.3970 42.2330 92.5260 39.6810Q89.6550 37.1290 89.6550 33.0110Q89.6550 29.6470 91.3660 27.3850Q93.0770 25.1230 96.0350 23.9630Q98.9930 22.8030 102.8210 22.8030Q108.9690 22.8030 112.7100 25.5000Q116.4510 28.1970 116.6830 33.3010L108.4470 33.3010Q108.2150 31.7930 106.7940 30.6910Q105.3730 29.5890 102.7050 29.5890Q100.5590 29.5890 99.2830 30.4010Q98.0070 31.2130 98.0070 32.6050Q98.0070 33.9390 99.1090 34.6350Q100.2110 35.3310 102.7050 35.6210L105.1990 35.8530Q110.9990 36.4910 114.2760 39.1300Q117.5530 41.7690 117.5530 46.1190Q117.5530 50.9330 113.7250 53.7170Q109.8970 56.5010 103.4010 56.5010M138.1430 56.6170Q134.0830 56.6170 130.9800 55.2250Q127.8770 53.8330 125.7890 51.4840Q123.7010 49.1350 122.6570 46.2060Q121.6130 43.2770 121.6130 40.2030L121.6130 39.0430Q121.6130 35.9110 122.6570 32.9530Q123.7010 29.9950 125.7890 27.6750Q127.8770 25.3550 130.8640 23.9920Q133.8510 22.6290 137.7950 22.6290Q142.8990 22.6290 146.4080 24.9200Q149.9170 27.2110 151.7730 30.9230Q153.6290 34.6350 153.6290 38.9270L153.6290 42.0590L130.3710 42.0590Q130.8350 45.3070 132.7200 47.1920Q134.6050 49.0770 138.1430 49.0770Q140.6370 49.0770 142.2900 48.1200Q143.9430 47.1630 144.5230 45.6550L153.0490 45.6550Q152.0050 50.5270 148.0320 53.5720Q144.0590 56.6170 138.1430 56.6170M137.7950 30.1690Q134.7790 30.1690 132.8940 31.8800Q131.0090 33.5910 130.4870 36.7810L144.7550 36.7810Q144.2910 33.5910 142.5220 31.8800Q140.7530 30.1690 137.7950 30.1690M181.9910 55.5150L172.4790 55.5150L172.4790 13.1750L197.8830 13.1750L197.8830 21.0630L181.9910 21.0630L181.9910 30.5750L197.1870 30.5750L197.1870 38.4630L181.9910 38.4630L181.9910 55.5150M212.2670 56.3270Q207.1050 56.3270 203.9440 53.6590Q200.7830 50.9910 200.7830 46.1190Q200.7830 42.6390 202.5810 40.4060Q204.3790 38.1730 207.6270 37.1000Q210.8750 36.0270 215.1090 36.0270L220.8510 36.0270L220.8510 35.9110Q220.8510 31.0390 215.9790 31.0390Q214.7030 31.0390 212.6150 31.1260Q210.5270 31.2130 208.2940 31.3000Q206.0610 31.3870 204.3210 31.5030L204.3210 23.6730Q206.3510 23.4990 209.3090 23.3540Q212.2670 23.2090 214.7610 23.2090Q222.0690 23.2090 225.9260 26.3120Q229.7830 29.4150 229.7830 36.0270L229.7830 55.5150L222.4170 55.5150L222.4170 49.5410Q221.3730 52.8470 218.8210 54.5870Q216.2690 56.3270 212.2670 56.3270M215.0510 49.8890Q217.3130 49.8890 218.9950 48.6130Q220.6770 47.3370 220.8510 43.7410L220.8510 41.1890L215.0510 41.1890Q212.6150 41.1890 211.3100 42.4070Q210.0050 43.6250 210.0050 45.5970Q210.0050 47.5110 211.3100 48.7000Q212.6150 49.8890 215.0510 49.8890M251.9390 56.6170Q247.8210 56.6170 244.7760 55.2540Q241.7310 53.8910 239.7010 51.5710Q237.6710 49.2510 236.6850 46.3220Q235.6990 43.3930 235.6990 40.2610L235.6990 39.1590Q235.6990 34.8090 237.5260 31.0390Q239.3530 27.2690 242.9780 24.9490Q246.6030 22.6290 251.8810 22.6290Q256.1730 22.6290 259.4790 24.2820Q262.7850 25.9350 264.7570 28.8930Q266.7290 31.8510 266.9610 35.6790L257.8550 35.6790Q257.6230 33.5330 256.1150 32.0540Q254.6070 30.5750 251.8810 30.5750Q248.3430 30.5750 246.6610 33.0980Q244.9790 35.6210 244.9790 39.7390Q244.9790 43.6250 246.5740 46.1480Q248.1690 48.6710 251.9390 48.6710Q254.7230 48.6710 256.2890 47.2210Q257.8550 45.7710 258.1450 43.3930L267.1930 43.3930Q266.9610 47.3370 264.9600 50.3240Q262.9590 53.3110 259.5660 54.9640Q256.1730 56.6170 251.9390 56.6170M292.0170 55.9210L287.5510 55.9210Q282.7370 55.9210 279.7790 54.7320Q276.8210 53.5430 275.4580 50.7300Q274.0950 47.9170 274.0950 43.1030L274.0950 30.5170L269.2810 30.5170L269.2810 23.7310L274.0950 23.7310L274.0950 15.1470L282.7370 15.1470L282.7370 23.7310L292.0170 23.7310L292.0170 30.5170L282.7370 30.5170L282.7370 43.4510Q282.7370 45.7130 283.9260 46.9020Q285.1150 48.0910 287.3190 48.0910L292.0170 48.0910L292.0170 55.9210M313.6510 56.6170Q308.0830 56.6170 304.1680 54.3550Q300.2530 52.0930 298.2230 48.4100Q296.1930 44.7270 296.1930 40.3770L296.1930 39.0430Q296.1930 34.5770 298.3100 30.8360Q300.4270 27.0950 304.3420 24.8620Q308.2570 22.6290 313.6510 22.6290Q319.0450 22.6290 322.9890 24.8620Q326.9330 27.0950 329.0500 30.8360Q331.1670 34.5770 331.1670 39.0430L331.1670 40.3770Q331.1670 44.7270 329.1080 48.4100Q327.0490 52.0930 323.1630 54.3550Q319.2770 56.6170 313.6510 56.6170M313.6510 48.7870Q317.6530 48.7870 319.7700 46.2060Q321.8870 43.6250 321.8870 39.7390Q321.8870 35.7370 319.7120 33.0980Q317.5370 30.4590 313.6510 30.4590Q309.7650 30.4590 307.6190 33.0980Q305.4730 35.7370 305.4730 39.7390Q305.4730 43.6250 307.5610 46.2060Q309.6490 48.7870 313.6510 48.7870M346.9430 55.5150L337.6630 55.5150L337.6630 23.7310L345.0290 23.7310L345.0290 34.5190Q345.5510 29.1250 348.3640 26.2250Q351.1770 23.3250 356.0490 23.3250L357.2670 23.3250L357.2670 31.3290L354.9470 31.3290Q351.0610 31.3290 349.0020 33.4170Q346.9430 35.5050 346.9430 39.3330L346.9430 55.5150M374.8990 54.8190L368.8670 54.8190L359.1230 23.7310L368.4610 23.7310L375.4790 47.5690L376.6390 47.5690L382.4390 23.7310L391.2550 23.7310L382.3810 58.0670Q381.3950 61.7790 379.7420 63.9830Q378.0890 66.1870 375.3340 67.1440Q372.5790 68.1010 368.4030 68.1010L362.7190 68.1010L362.7190 60.2130L369.3310 60.2130Q371.5350 60.2130 372.7820 59.3430Q374.0290 58.4730 374.6090 56.2110"
                fill="currentColor"
              />
            </svg>
            <p className="text-white/40 text-sm tracking-widest uppercase">Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5 text-red-400 text-xs"
              >
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-white/60 transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or Email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-white/60 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-12 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white/60 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-4 h-4 border border-white/20 rounded bg-white/5 checked:bg-white checked:border-white transition-all cursor-pointer"
                  />
                  <svg className="absolute w-2.5 h-2.5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity text-black" viewBox="0 0 14 10" fill="none">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-white/40 text-xs group-hover:text-white/60 transition-colors">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-semibold rounded-2xl py-4 text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="group w-full relative flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-all duration-300 shadow-[0_0_0_rgba(255,255,255,0)] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-0.5 text-xs font-semibold uppercase tracking-widest"
            >
              Back to Website
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
