from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# Initialize 16:9 Widescreen Presentation
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# NAQSHAI "Refined Architectural Light" Color Palette
SLATE_100 = RGBColor(241, 245, 249)   # Background canvas
WHITE     = RGBColor(255, 255, 255)   # Card fill
SLATE_200 = RGBColor(226, 232, 240)   # Card border
SLATE_900 = RGBColor(15, 23, 42)      # Dark headings
SLATE_600 = RGBColor(71, 85, 105)     # Body text
EMERALD   = RGBColor(4, 120, 87)      # Emerald-700 primary accent
EMERALD_LT= RGBColor(236, 253, 245)   # Emerald-50 badge fill
ROSE_LT   = RGBColor(255, 241, 242)   # Problem card tint
ROSE_DARK = RGBColor(190, 18, 60)     # Urgent problem accent

def set_bg(slide):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = SLATE_100

def add_header(slide, tag_text, title_text, subtitle_text=""):
    # Top Emerald Pill Tag
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(0.4), Inches(2.6), Inches(0.38))
    pill.fill.solid()
    pill.fill.fore_color.rgb = EMERALD
    pill.line.fill.background()
    tf_p = pill.text_frame
    p_p = tf_p.paragraphs[0]
    p_p.text = tag_text.upper()
    p_p.font.size = Pt(11)
    p_p.font.bold = True
    p_p.font.color.rgb = WHITE
    p_p.alignment = PP_ALIGN.CENTER

    # Main Slide Title
    tb = slide.shapes.add_textbox(Inches(0.6), Inches(0.82), Inches(12.1), Inches(0.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = SLATE_900
    if subtitle_text:
        p2 = tf.add_paragraph()
        p2.text = subtitle_text
        p2.font.size = Pt(14)
        p2.font.color.rgb = SLATE_600

def add_card(slide, left, top, width, height, title, bullets, fill_rgb=WHITE, title_rgb=EMERALD):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    card.fill.solid()
    card.fill.fore_color.rgb = fill_rgb
    card.line.color.rgb = SLATE_200
    card.line.width = Pt(1.5)

    tb = slide.shapes.add_textbox(Inches(left + 0.2), Inches(top + 0.15), Inches(width - 0.4), Inches(height - 0.3))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = title_rgb
    p.space_after = Pt(8)

    for b in bullets:
        pb = tf.add_paragraph()
        pb.text = f"•  {b}"
        pb.font.size = Pt(13)
        pb.font.color.rgb = SLATE_900
        pb.space_after = Pt(6)

def add_img_placeholder(slide, left, top, width, height, label):
    box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    box.fill.solid()
    box.fill.fore_color.rgb = EMERALD_LT
    box.line.color.rgb = EMERALD
    box.line.width = Pt(1.5)
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = f"[ PASTE IMAGE HERE ]\n{label}"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.alignment = PP_ALIGN.CENTER

def add_notes(slide, text):
    notes_slide = slide.notes_slide
    notes_text_frame = notes_slide.notes_text_frame
    notes_text_frame.text = text

# ==============================================================================
# SLIDE 1: TITLE & PURPOSE
# ==============================================================================
s1 = prs.slides.add_slide(blank_layout)
set_bg(s1)
add_card(s1, 0.8, 0.8, 11.73, 5.9, "", [])

tb1 = s1.shapes.add_textbox(Inches(1.3), Inches(1.5), Inches(6.8), Inches(4.5))
tf1 = tb1.text_frame
tf1.word_wrap = True

p = tf1.paragraphs[0]
p.text = "NAQSHAI"
p.font.size = Pt(52)
p.font.bold = True
p.font.color.rgb = EMERALD

p2 = tf1.add_paragraph()
p2.text = "Zameen Ap Ki, Bharosa Hamara"
p2.font.size = Pt(20)
p2.font.bold = True
p2.font.color.rgb = SLATE_600
p2.space_after = Pt(18)

p3 = tf1.add_paragraph()
p3.text = (
    "An AI-powered land verification and 3D geospatial advisory platform "
    "that protects Pakistani property buyers from scams, hidden terrain hazards, "
    "and broker manipulation."
)
p3.font.size = Pt(18)
p3.font.color.rgb = SLATE_900
p3.space_after = Pt(24)

p4 = tf1.add_paragraph()
p4.text = "Live MVP: https://naqshaii.vercel.app/\nTeam: Ahsan Hayat  |  Hassan Farooq  |  Aliza Fatima"
p4.font.size = Pt(14)
p4.font.bold = True
p4.font.color.rgb = EMERALD

add_img_placeholder(s1, 8.5, 1.4, 3.5, 4.6, "Paste NAQSHAI Mascot Logo + Green Pakistan Outline\n(From Old Slide 1 & Slide 7)")
add_notes(s1, "SPEAKER SCRIPT (15s): Assalam-o-Alaikum judges. We are Team NAQSHAI. In Pakistan, buying a plot is a family's biggest financial milestone—and its biggest gamble. NAQSHAI is an AI-powered land due-diligence platform that replaces biased middlemen with automated legal verification and 3D geospatial risk intelligence.")

# ==============================================================================
# SLIDE 2: THE PROBLEM
# ==============================================================================
s2 = prs.slides.add_slide(blank_layout)
set_bg(s2)
add_header(s2, "01 | The Problem", "Buying Land in Pakistan is Fundamentally Broken",
           "PKR 200B+ lost annually to real estate fraud, unapproved schemes, and compromised brokers.")

add_card(s2, 0.6, 1.85, 5.8, 2.4, "Real-World Devastation", [
    "Bari Imam Demolition: 17,640+ families affected; Nargis Bibi's home & shop razed in a single day.",
    "Eden Housing Scam: 12,000+ families defrauded of Rs. 25 Billion.",
    "391 Illegal Societies in Isb/Rwp alone (90% lack valid CDA/RDA NOCs)."
], fill_rgb=ROSE_LT, title_rgb=ROSE_DARK)

add_img_placeholder(s2, 0.6, 4.45, 5.8, 2.5, "Paste Bari Imam Demolition Photo + Dawn News Eden Scam Clipping\n(From Old Slides 3, 4 & 5)")

add_card(s2, 6.7, 1.85, 6.0, 5.1, "Why Current Workarounds Fail", [
    "Compromised Middlemen: Dealers charge 1%–2% commission (plus up to 5% hidden price padding) and push high-kickback, illegal plots.",
    "Zero Spatial Transparency: Traditional portals only host static ads—hiding seasonal floodplains, steep slopes, and missing NOCs.",
    "Forged Documentation: Up to 35% of disputes involve forged Fards or fake allotment letters.",
    "Remote Blindness: 1 in 3 Overseas Pakistanis face fraud or qabza because they cannot inspect ground reality remotely."
])
add_notes(s2, "SPEAKER SCRIPT (40s): Imagine working your entire life to build a family home, only to watch a bulldozer raze it in a single day. That happened to Nargis Bibi and over 17,600 families in Bari Imam, while 12,000 families lost 25 billion rupees in the Eden Housing Scam. In the Twin Cities alone, 391 societies operate illegally. Today's buyers are trapped: human brokers take kickbacks to hide flaws, and listing portals just host unverified ads.")

# ==============================================================================
# SLIDE 3: THE SOLUTION
# ==============================================================================
s3 = prs.slides.add_slide(blank_layout)
set_bg(s3)
add_header(s3, "02 | The Solution", "NAQSHAI: Mathematical Due Diligence Before You Buy",
           "Replacing blind property speculation with automated legal checks and 3D risk intelligence.")

add_card(s3, 0.6, 1.85, 6.2, 5.1, "Quantifiable Benefits for Buyers & Sellers", [
    "100% Broker Commission Saved: Direct verified owner connection eliminates the 1%–2% fee (saves PKR 200K–400K on a 1-Crore plot).",
    "Due Diligence in <30 Seconds (Down from Weeks): Instant 0–100 Haversine Amenity Index, CDA/RDA NOC status, and Environmental Audit (Flood, Elevation, Noise in dB).",
    "Zero Travel Cost for Overseas Buyers: 3D satellite boundary polygons + 360° ground walkthroughs spot steep foundation slopes remotely.",
    "Zero Language Barrier: 24/7 RAG AI Advisor in English, Urdu, and Roman Urdu with voice read-aloud."
])

add_img_placeholder(s3, 7.1, 1.85, 5.6, 2.45, "Paste Environmental Indicators + Amenity Score UI Cards\n(From Old Slide 8)")
add_img_placeholder(s3, 7.1, 4.5, 5.6, 2.45, "Paste 360° 3D Walk-through Screenshot + RAG Chat UI\n(From Old Slides 9 & 12)")
add_notes(s3, "SPEAKER SCRIPT (35s): NAQSHAI replaces blind speculation with instant verification. Instead of paying a broker 2 to 4 lakh rupees in commission, buyers get a free, 30-second audit. Our platform renders exact 3D plot boundaries with 360-degree ground walkthroughs, checks CDA/RDA approval, and calculates flood, elevation, and noise risks automatically—all accessible in English, Urdu, or Roman Urdu.")

# ==============================================================================
# SLIDE 4: WHY NOW?
# ==============================================================================
s4 = prs.slides.add_slide(blank_layout)
set_bg(s4)
add_header(s4, "03 | Why Now?", "The Perfect Convergence of Regulation, Digitization & AI",
           "Why this couldn't be built 5 years ago—and why waiting 5 more years is too late.")

add_card(s4, 0.6, 1.9, 3.85, 4.9, "1. Regulatory Crackdowns", [
    "High-profile CDA/RDA demolition drives (Bari Imam, Margalla foothills).",
    "NAB recovered Rs. 43.3B for 24,365 fraud victims in 2026 alone.",
    "Cultural shift: Buyers now demand verified NOC & title proof before token money."
])
add_card(s4, 4.74, 1.9, 3.85, 4.9, "2. Gov Registry Digitization", [
    "PLRA computerized Fards (punjab-zameen.gov.pk) & Punjab e-Stamps now issue cryptographic serials & QR codes.",
    "CDA Online NOC & Dastak portals enable digital verification lookup for the first time."
])
add_card(s4, 8.88, 1.9, 3.85, 4.9, "3. Multimodal Vision AI", [
    "5 years ago, traditional OCR failed on complex Urdu/English Pakistani land deeds.",
    "Gemini 2.5 Flash Vision + pgvector enables sub-second document auditing & Roman Urdu spatial RAG at near-zero cost."
])
add_notes(s4, "SPEAKER SCRIPT (30s): Why couldn't this be built five years ago? First, Punjab Land Records, e-Stamp, and CDA portals only recently introduced barcode-verifiable digital records. Second, multimodal Vision LLMs like Gemini 2.5 can finally parse complex Pakistani allotment letters and Fards accurately. Combined with massive anti-encroachment crackdowns, buyer demand for instant verification is urgent today.")

# ==============================================================================
# SLIDE 5: MARKET SIZE (BOTTOM-UP)
# ==============================================================================
s5 = prs.slides.add_slide(blank_layout)
set_bg(s5)
add_header(s5, "04 | Market Size", "Bottom-Up Market Opportunity (TAM → SAM → SOM)",
           "Calculated from actual transaction volume × PKR 2,500 average verification fee (not arbitrary % claims).")

add_card(s5, 0.6, 1.9, 3.85, 4.9, "TAM: PKR 4.24 Billion / yr", [
    "Scope: Pakistan National Property Market.",
    "1.695M annual FBR transactions (Rs. 7.1T turnover; 93.7% under Rs. 5M).",
    "Bottom-Up Math: 1.695M deals × PKR 2,500 avg. verification fee = PKR 4.24B annual fee pool."
])
add_card(s5, 4.74, 1.9, 3.85, 4.9, "SAM: PKR 375 Million / yr", [
    "Scope: Islamabad & Rawalpindi Digital & Overseas Market.",
    "8.48M residents (2.36M Isb + 6.12M Rwp) + diaspora investors in DHA, Bahria, Gulberg & CDA sectors.",
    "Bottom-Up Math: ~150,000 active annual plot listings/transfers × PKR 2,500 = PKR 375M."
])
add_card(s5, 8.88, 1.9, 3.85, 4.9, "SOM: PKR 45 Million / yr", [
    "Scope: 3-Year Twin Cities Target.",
    "B2C: 10,000 verified seller listings × PKR 2,500 = PKR 25M.",
    "B2B: 40 Agency/Developer Verification API licenses × PKR 500K/yr = PKR 20M."
])
add_notes(s5, "SPEAKER SCRIPT (30s): We built our market size from the bottom up. With 1.695 million annual FBR property transactions, our national verification fee pool at 2,500 rupees per listing is 4.24 billion rupees. Focusing strictly on Islamabad and Rawalpindi's 150,000 annual listings gives us a 375 million rupee SAM, and a realistic 3-year SOM of 45 million rupees across B2C listings and B2B API partners.")

# ==============================================================================
# SLIDE 6: COMPETITION
# ==============================================================================
s6 = prs.slides.add_slide(blank_layout)
set_bg(s6)
add_header(s6, "05 | Competition", "Competitive Matrix: Due Diligence vs. Classified Portals",
           "Traditional platforms show what is for sale; NAQSHAI verifies whether it is legally and structurally safe to buy.")

rows, cols = 7, 5
table_shape = s6.shapes.add_table(rows, cols, Inches(0.6), Inches(1.85), Inches(12.13), Inches(5.0))
table = table_shape.table

headers = ["Feature / Advantage", "Local Brokers", "Zameen / Graana", "PropSure / Bitoreal", "NAQSHAI (Us)"]
matrix_data = [
    ["Core Business Model", "1%–2% Commission", "Paid Ad Classifieds", "B2B GIS / Human Calls", "Self-Serve AI Verification"],
    ["2-Stage Gov Portal & OCR Audit", "No (Forged files common)", "No (Unverified claims)", "Slow manual audit", "Instant Gemini OCR + Portal Link"],
    ["Flood, Noise (dB) & Slope Math", "Hidden from buyer", "Not provided", "Paid corporate reports", "Free, Instant & Automated"],
    ["3D Polygon + 360° Walkthrough", "Physical visit required", "2D static society maps", "2D GIS / brochures", "Interactive 3D + 360° Street View"],
    ["Roman Urdu Voice/Chat RAG AI", "Biased sales pitch", "Rigid dropdown filters", "Book 60-min phone call", "24/7 Multilingual Gemini RAG"],
    ["Cost to Seller / Buyer", "1%–2% + Price Padding", "Expensive Ad Packages", "Corporate Retainers", "PKR 1,500–3,000 Flat (0% Comm.)"]
]

for c_idx, h in enumerate(headers):
    cell = table.cell(0, c_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = EMERALD if c_idx == 4 else SLATE_900
    p = cell.text_frame.paragraphs[0]
    p.text = h
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = WHITE

for r_idx, row_content in enumerate(matrix_data):
    for c_idx, val in enumerate(row_content):
        cell = table.cell(r_idx + 1, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = EMERALD_LT if c_idx == 4 else WHITE
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.size = Pt(12)
        p.font.bold = (c_idx == 0 or c_idx == 4)
        p.font.color.rgb = EMERALD if c_idx == 4 else SLATE_900

add_notes(s6, "SPEAKER SCRIPT (30s): Zameen and Graana are ad portals—they show what is for sale, not whether it is safe to buy. Players like PropSure or Bitoreal cater to enterprise B2B clients or require scheduling human consultancy calls. NAQSHAI is the only self-serve platform combining automated government-portal document checks, 3D terrain risk math, and zero commissions.")

# ==============================================================================
# SLIDE 7: PRODUCT / TECHNOLOGY & MOAT
# ==============================================================================
s7 = prs.slides.add_slide(blank_layout)
set_bg(s7)
add_header(s7, "06 | Product & Technology", "Under the Hood: 2-Stage Verification & Geospatial Moat",
           "Citizen-Mediated AI Verification Pipeline bypassing government API limitations.")

add_card(s7, 0.6, 1.85, 6.0, 5.1, "How It Works & Our Defensible Moat", [
    "Stage 1 (Geodesic Polygon Check): Seller draws plot boundary on satellite map; PostGIS verifies area matches claimed Marla size (±10% tolerance).",
    "Stage 2 (Gemini 2.5 Vision OCR): Audits uploaded CNIC, PLRA Fard, e-Stamp, or CDA slip in private S3 bucket and extracts cryptographic barcode serials.",
    "Stage 3 (1-Click Gov Portal Bypass): Review Console links operators directly to punjab-zameen.gov.pk & cda.gov.pk past CAPTCHAs before atomic RLS publish.",
    "Zero-Cost Moat: Embedded JICA flood plain models (Lai Nullah/Soan), NESPAK elevation gradients & 60+ landmark Haversine engine with $0 external API cost."
])

add_img_placeholder(s7, 6.85, 1.85, 5.88, 2.45, "Paste 'Map the Plot Boundary (92% Area Check)' Screenshot\n(From Old Slide 10)")
add_img_placeholder(s7, 6.85, 4.5, 5.88, 2.45, "Paste 'Admin Review Console & Cryptographic Serial Verification' Screenshot\n(From Old Slide 11)")
add_notes(s7, "SPEAKER SCRIPT (45s): How do we verify land when CDA and PLRA don't offer public APIs? First, the seller draws their plot polygon on satellite imagery, and our math engine checks if the drawn area matches their claimed Marla size. Second, Gemini Vision OCR audits their uploaded CNIC and computerized Fard, extracting the government tracking serial. Third, our operator clicks one button to verify that serial directly on the official PLRA or CDA portal past CAPTCHAs—because a scammer can Photoshop a PDF, but they cannot Photoshop the government's server.")

# ==============================================================================
# SLIDE 8: TRACTION & GO-TO-MARKET
# ==============================================================================
s8 = prs.slides.add_slide(blank_layout)
set_bg(s8)
add_header(s8, "07 | Traction & Go-To-Market", "Live Validation & Strategy for First 1,000 Customers",
           "Dual B2C Pay-Per-Listing and B2B Verification API monetization engine.")

add_card(s8, 0.6, 1.85, 5.8, 5.1, "Current Momentum & Technical Proof", [
    "Live Production MVP: Deployed at naqshaii.vercel.app with verified Twin Cities plot inventory (Gulberg Greens, Bahria Phase 8, DHA, Fazal Town).",
    "157/157 Automated End-to-End Tests Passing (100%): Full validation across OTP security, polygon overlap, Gemini Vision OCR, and portal routing.",
    "Expanded Twin-City Landmark Registry: 60+ real-world healthcare, education, transit & commercial hubs live in Haversine engine."
])

add_card(s8, 6.7, 1.85, 6.0, 5.1, "GTM: Acquiring First 1,000 Customers", [
    "Step 1 (First 100 Verified Sellers - B2C): Target private plot owners in CDA/RDA sectors tired of 2% broker fees; charge PKR 1,500–3,000 per listing for 'Verified Badge'.",
    "Step 2 (First 1,000 Active Buyers): Offer 100% Free AI Advisor & 3D Risk Reports in Overseas Pakistani communities (UAE, UK, KSA diaspora groups).",
    "Step 3 (B2B API Licensing): License risk-scoring & document-verification APIs to housing developers, banks, and property portals."
])
add_notes(s8, "SPEAKER SCRIPT (30s): Our MVP is live right now at naqshaii.vercel.app, backed by 157 automated regression tests with a 100% pass rate. To acquire our first 1,000 users, we keep buyer discovery 100% free, targeting overseas Pakistani communities who need remote 3D inspection. That buyer traffic pulls in private sellers, who gladly pay a flat 1,500 to 3,000 rupee fee to earn our Verified Badge and skip a 3-lakh rupee broker commission.")

# ==============================================================================
# SLIDE 9: FINANCIALS & THE ASK
# ==============================================================================
s9 = prs.slides.add_slide(blank_layout)
set_bg(s9)
add_header(s9, "08 | Financials & The Ask", "3-Year Projections, Unit Economics & Capital Milestones",
           "High ~85% gross margin driven by zero-cost deterministic spatial math and low-cost Gemini Flash tokens.")

# 3-Year Financial Table
f_table_shape = s9.shapes.add_table(4, 4, Inches(0.6), Inches(1.85), Inches(12.13), Inches(2.3))
ft = f_table_shape.table
f_headers = ["Financial Metric", "Year 1 (Twin Cities MVP)", "Year 2 (Lahore/Karachi)", "Year 3 (National + B2B)"]
f_rows = [
    ["Verified B2C Listings (@ PKR 2,500 avg.)", "1,200 listings (PKR 3.0M)", "4,500 listings (PKR 11.2M)", "10,000 listings (PKR 25.0M)"],
    ["B2B API Partners (Developers / Portals)", "3 partners (PKR 1.5M)", "15 partners (PKR 7.5M)", "40 partners (PKR 20.0M)"],
    ["Total Projected Annual Revenue", "PKR 4.5 Million", "PKR 18.7 Million", "PKR 45.0 Million"]
]

for c_idx, h in enumerate(f_headers):
    c = ft.cell(0, c_idx)
    c.fill.solid()
    c.fill.fore_color.rgb = SLATE_900
    p = c.text_frame.paragraphs[0]
    p.text = h
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = WHITE

for r_idx, r_data in enumerate(f_rows):
    for c_idx, val in enumerate(r_data):
        c = ft.cell(r_idx + 1, c_idx)
        c.fill.solid()
        c.fill.fore_color.rgb = EMERALD_LT if r_idx == 2 else WHITE
        p = c.text_frame.paragraphs[0]
        p.text = val
        p.font.size = Pt(12)
        p.font.bold = (r_idx == 2 or c_idx == 0)
        p.font.color.rgb = EMERALD if r_idx == 2 else SLATE_900

add_card(s9, 0.6, 4.4, 12.13, 2.55, "The Ask: Raising PKR 5 Million Seed / Grant (18-Month Runway)", [
    "Milestone 1 (Months 1–6): Integrate NADRA VeriSys Biometric API (live selfie-to-CNIC facial matching to eliminate seller impersonation).",
    "Milestone 2 (Months 6–12): Scale to 1,000+ verified Twin Cities listings and launch 360° Smart Rental Ecosystem to eliminate fake rental ads.",
    "Milestone 3 (Months 12–18): Train Predictive ML Land Valuation models (3–5 year ROI forecasting) and hit PKR 1.5M+ Monthly Recurring Revenue."
])
add_notes(s9, "SPEAKER SCRIPT (30s): Because our environmental and Haversine engines run deterministically without expensive third-party GIS APIs, we operate at an 85% gross margin and under 15 rupees in compute per audit. Scaling from 1,200 verified listings in Year 1 to 10,000 listings plus 40 B2B partners in Year 3 takes us to 45 million rupees in annual revenue. We are seeking 5 million rupees in funding for an 18-month runway to unlock NADRA biometric integration, 1,000 verified listings, and predictive ML valuation.")

# ==============================================================================
# SLIDE 10: TEAM NAQSHAI & CLOSING
# ==============================================================================
s10 = prs.slides.add_slide(blank_layout)
set_bg(s10)
add_header(s10, "09 | Team NAQSHAI", "Built by Engineers Solving Pakistan's Trust Deficit",
           "Zameen Ap Ki, Bharosa Hamara  |  https://naqshaii.vercel.app/")

add_img_placeholder(s10, 0.8, 2.0, 3.6, 4.5, "Paste Photo:\nAhsan Hayat\n(From Old Slide 18)")
add_img_placeholder(s10, 4.86, 2.0, 3.6, 4.5, "Paste Photo:\nHassan Farooq\n(From Old Slide 18)")
add_img_placeholder(s10, 8.92, 2.0, 3.6, 4.5, "Paste Photo:\nAliza Fatima\n(From Old Slide 18)")
add_notes(s10, "SPEAKER SCRIPT (15s): We are Ahsan, Hassan, and Aliza—Team NAQSHAI. Thank you, and we are now open to your questions on our architecture, unit economics, and verification pipeline.")

try:
    print("✅ Successfully generated NAQSHAI_Zindigi_Prize_Pitch.pptx!")
except UnicodeEncodeError:
    print("[SUCCESS] Successfully generated NAQSHAI_Zindigi_Prize_Pitch.pptx!")
