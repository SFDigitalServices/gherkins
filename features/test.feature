@test
Feature: Test feature

  @basic
  Scenario: sf.gov Services heading
    When I visit 'https://sf.gov'
    Then a heading with text 'Services' should be visible

  @search
  Scenario: sf.gov search
    When I visit 'https://sf.gov'
     And I click the element with placeholder 'Search'
     And I type 'sf shines'
     And I press Enter
    Then the URL should be 'https://sf.gov/search?keyword=sf%20shines' after 1 second
     And a link to 'https://oewd.org/sf-shines' should be visible
