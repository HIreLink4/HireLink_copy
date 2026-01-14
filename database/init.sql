-- ============================================================================
-- HIRELINK DATABASE INITIALIZATION SCRIPT
-- Academic Project - ENSATE 2026
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS hirelink_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hirelink_db;

-- ============================================================================
-- SEED DATA: Service Categories
-- ============================================================================
INSERT INTO service_categories (category_name, category_slug, category_description, category_icon, is_active, is_featured, display_order) VALUES
('Electrical', 'electrical', 'Electrical repairs, wiring, and installation services', 'BoltIcon', true, true, 1),
('Plumbing', 'plumbing', 'Pipe repairs, installations, and drainage services', 'WrenchScrewdriverIcon', true, true, 2),
('Cleaning', 'cleaning', 'Home cleaning, deep cleaning, and sanitation services', 'SparklesIcon', true, true, 3),
('Carpentry', 'carpentry', 'Furniture repair, woodwork, and installations', 'HomeModernIcon', true, true, 4),
('AC & Appliances', 'ac-repair', 'AC repair, installation, and appliance servicing', 'ComputerDesktopIcon', true, true, 5),
('Painting', 'painting', 'Interior and exterior painting services', 'PaintBrushIcon', true, false, 6),
('Pest Control', 'pest-control', 'Pest extermination and prevention services', 'BugAntIcon', true, false, 7),
('Home Improvement', 'home-improvement', 'Renovations, repairs, and home upgrades', 'WrenchIcon', true, false, 8);

-- ============================================================================
-- SEED DATA: Demo Users
-- ============================================================================
-- Password for all demo users is: password123 (BCrypt hash)
-- $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4y3yD3.F6.2yJZ5C

-- Demo Customer
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_phone_verified, created_at) VALUES
('John Customer', 'john@example.com', '+919876543210', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4y3yD3.F6.2yJZ5C', 'CUSTOMER', 'ACTIVE', true, NOW());

-- Demo Providers
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_phone_verified, created_at) VALUES
('Rajesh Electrician', 'rajesh@example.com', '+919876543211', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4y3yD3.F6.2yJZ5C', 'PROVIDER', 'ACTIVE', true, NOW()),
('Suresh Plumber', 'suresh@example.com', '+919876543212', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4y3yD3.F6.2yJZ5C', 'PROVIDER', 'ACTIVE', true, NOW()),
('Priya Cleaning', 'priya@example.com', '+919876543213', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4y3yD3.F6.2yJZ5C', 'PROVIDER', 'ACTIVE', true, NOW()),
('Kumar Carpenter', 'kumar@example.com', '+919876543214', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4y3yD3.F6.2yJZ5C', 'PROVIDER', 'ACTIVE', true, NOW());

-- ============================================================================
-- SEED DATA: Service Providers
-- ============================================================================
INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_pincode, service_radius_km, kyc_status, average_rating, total_reviews, total_bookings, completed_bookings, is_available, is_featured, created_at) VALUES
((SELECT user_id FROM users WHERE phone = '+919876543211'), 'Rajesh Electrical Services', 'Professional electrical services with 10+ years of experience. We handle all types of electrical work from repairs to complete installations.', 'Powering Your Home Safely', 10, '400001', 15, 'VERIFIED', 4.80, 156, 200, 185, true, true, NOW()),
((SELECT user_id FROM users WHERE phone = '+919876543212'), 'Suresh Plumbing Solutions', 'Expert plumbing services for residential and commercial needs. Quick response and quality workmanship guaranteed.', 'Your Pipe Problems, Solved', 8, '400001', 12, 'VERIFIED', 4.70, 124, 180, 165, true, true, NOW()),
((SELECT user_id FROM users WHERE phone = '+919876543213'), 'Priya Home Cleaning', 'Professional cleaning services for homes and offices. Eco-friendly products and trained staff.', 'Sparkling Clean Spaces', 5, '400001', 10, 'VERIFIED', 4.90, 89, 150, 145, true, true, NOW()),
((SELECT user_id FROM users WHERE phone = '+919876543214'), 'Kumar Woodworks', 'Custom furniture, repairs, and all carpentry work. Quality craftsmanship at affordable prices.', 'Crafting Excellence in Wood', 15, '400001', 20, 'VERIFIED', 4.75, 67, 100, 92, true, false, NOW());

-- ============================================================================
-- SEED DATA: Services
-- ============================================================================
-- Electrical Services
INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes, is_active, is_featured, created_at) VALUES
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543211'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'electrical'),
 'Fan Installation', 'Professional ceiling fan installation with proper wiring and safety checks', 350.00, 'FIXED', 45, true, true, NOW()),
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543211'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'electrical'),
 'Switchboard Repair', 'Repair and replacement of switches, sockets, and MCBs', 200.00, 'STARTING_FROM', 30, true, false, NOW()),
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543211'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'electrical'),
 'Complete Wiring', 'Full house electrical wiring and installation', 5000.00, 'STARTING_FROM', 480, true, true, NOW());

-- Plumbing Services
INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes, is_active, is_featured, created_at) VALUES
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543212'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'plumbing'),
 'Tap Repair', 'Fix leaking taps and replace washers', 150.00, 'FIXED', 20, true, true, NOW()),
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543212'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'plumbing'),
 'Pipe Fitting', 'New pipe installation and fitting work', 500.00, 'STARTING_FROM', 60, true, false, NOW()),
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543212'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'plumbing'),
 'Drainage Cleaning', 'Clear blocked drains and sewage lines', 400.00, 'FIXED', 45, true, true, NOW());

-- Cleaning Services
INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes, is_active, is_featured, created_at) VALUES
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543213'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'cleaning'),
 'Deep Home Cleaning', 'Complete deep cleaning of 2BHK home including kitchen and bathrooms', 2500.00, 'FIXED', 240, true, true, NOW()),
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543213'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'cleaning'),
 'Bathroom Cleaning', 'Thorough bathroom cleaning and sanitization', 500.00, 'FIXED', 60, true, false, NOW()),
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543213'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'cleaning'),
 'Kitchen Cleaning', 'Complete kitchen cleaning including appliances', 800.00, 'FIXED', 90, true, true, NOW());

-- Carpentry Services
INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes, is_active, is_featured, created_at) VALUES
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543214'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'carpentry'),
 'Furniture Repair', 'Repair and restoration of wooden furniture', 300.00, 'STARTING_FROM', 60, true, true, NOW()),
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543214'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'carpentry'),
 'Door Installation', 'Install new doors with frame and fittings', 1500.00, 'FIXED', 120, true, false, NOW()),
((SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543214'),
 (SELECT category_id FROM service_categories WHERE category_slug = 'carpentry'),
 'Custom Furniture', 'Custom made furniture as per requirements', 5000.00, 'STARTING_FROM', 0, true, true, NOW());

-- ============================================================================
-- SEED DATA: Demo Bookings
-- ============================================================================
INSERT INTO bookings (booking_number, user_id, provider_id, service_id, scheduled_date, scheduled_time, service_address, service_pincode, issue_description, urgency_level, estimated_amount, booking_status, created_at) VALUES
('HL20260114001', 
 (SELECT user_id FROM users WHERE phone = '+919876543210'),
 (SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543211'),
 (SELECT service_id FROM services WHERE service_name = 'Fan Installation' LIMIT 1),
 DATE_ADD(CURDATE(), INTERVAL 2 DAY),
 '10:00:00',
 '123 Main Street, Apartment 4B, Mumbai',
 '400001',
 'Need to install a new ceiling fan in the bedroom',
 'MEDIUM',
 350.00,
 'CONFIRMED',
 NOW()),
('HL20260114002', 
 (SELECT user_id FROM users WHERE phone = '+919876543210'),
 (SELECT provider_id FROM service_providers sp JOIN users u ON sp.user_id = u.user_id WHERE u.phone = '+919876543213'),
 (SELECT service_id FROM services WHERE service_name = 'Deep Home Cleaning' LIMIT 1),
 DATE_ADD(CURDATE(), INTERVAL 5 DAY),
 '09:00:00',
 '123 Main Street, Apartment 4B, Mumbai',
 '400001',
 'Full home deep cleaning required before a family event',
 'MEDIUM',
 2500.00,
 'PENDING',
 NOW());

-- ============================================================================
-- End of Seed Data
-- ============================================================================
SELECT 'Database initialized successfully with seed data!' AS Status;
