#!/usr/bin/env python3
"""
Backend API Testing for Auto Discount Location B2B Platform
Tests all major API endpoints and functionality
"""

import requests
import sys
import json
from datetime import datetime

class AutoDiscountAPITester:
    def __init__(self, base_url="https://agent-booking-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            self.passed_tests.append(test_name)
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - FAILED: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.log_result(name, True)
                try:
                    return response.json() if response.content else {}
                except:
                    return {}
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail += f" - {response.json()}"
                except:
                    error_detail += f" - {response.text[:200]}"
                self.log_result(name, False, error_detail)
                return {}

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return {}

    def test_api_info(self):
        """Test API info endpoint"""
        return self.run_test("API Info", "GET", "", 200)

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "admin@autodiscount.fr",
            "password": "admin123"
        }
        response = self.run_test("Admin Login", "POST", "auth/login", 200, login_data)
        if response and 'access_token' in response:
            self.admin_token = response['access_token']
            return True
        return False

    def test_agent_registration(self):
        """Test agent registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        agent_data = {
            "email": f"agent_{timestamp}@test.com",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "Agent",
            "phone": "+590690123456",
            "role": "agent",
            "language": "fr"
        }
        response = self.run_test("Agent Registration", "POST", "auth/register", 200, agent_data)
        if response and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_vehicles(self):
        """Test get vehicles endpoint"""
        return self.run_test("Get Vehicles", "GET", "vehicles", 200)

    def test_get_vehicle_categories(self):
        """Test get vehicle categories"""
        return self.run_test("Get Vehicle Categories", "GET", "vehicles/categories", 200)

    def test_get_agencies(self):
        """Test get agencies"""
        return self.run_test("Get Agencies", "GET", "agencies", 200)

    def test_get_faq(self):
        """Test get FAQ"""
        return self.run_test("Get FAQ", "GET", "faq", 200)

    def test_get_challenges(self):
        """Test get challenges"""
        return self.run_test("Get Challenges", "GET", "challenges", 200)

    def test_agent_dashboard(self):
        """Test agent dashboard (requires auth)"""
        if not self.token:
            self.log_result("Agent Dashboard", False, "No auth token available")
            return {}
        return self.run_test("Agent Dashboard", "GET", "agents/dashboard", 200)

    def test_admin_stats(self):
        """Test admin stats (requires admin auth)"""
        if not self.admin_token:
            self.log_result("Admin Stats", False, "No admin token available")
            return {}
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test("Admin Stats", "GET", "admin/stats", 200, headers=headers)

    def test_admin_seed_data(self):
        """Test admin seed data endpoint"""
        if not self.admin_token:
            self.log_result("Admin Seed Data", False, "No admin token available")
            return {}
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        return self.run_test("Admin Seed Data", "POST", "admin/seed", 200, headers=headers)

    def test_vehicle_filters(self):
        """Test vehicle filtering"""
        # Test with category filter
        self.run_test("Vehicles with Category Filter", "GET", "vehicles?category_id=cat-eco", 200)
        
        # Test with fuel type filter
        self.run_test("Vehicles with Fuel Filter", "GET", "vehicles?fuel_type=electric", 200)
        
        # Test with transmission filter
        self.run_test("Vehicles with Transmission Filter", "GET", "vehicles?transmission=automatic", 200)

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Auto Discount Location API Tests")
        print("=" * 60)

        # Basic API tests (no auth required)
        self.test_api_info()
        self.test_health_check()
        self.test_get_vehicles()
        self.test_get_vehicle_categories()
        self.test_get_agencies()
        self.test_get_faq()
        self.test_get_challenges()
        self.test_vehicle_filters()

        # Admin authentication and admin-only endpoints
        if self.test_admin_login():
            self.test_admin_stats()
            self.test_admin_seed_data()

        # Agent registration and agent-only endpoints
        if self.test_agent_registration():
            self.test_agent_dashboard()

        # Print final results
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")

        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure['details']}")

        if self.passed_tests:
            print("\n✅ PASSED TESTS:")
            for test in self.passed_tests:
                print(f"  - {test}")

        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = AutoDiscountAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())