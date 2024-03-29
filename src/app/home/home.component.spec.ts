// This shows a different way of testing a component, check about for a simpler one
/* eslint-disable */
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HomeComponent } from "./home.component";

describe("Home Component", () => {
  const html = "<pydt-home></pydt-home>";

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [HomeComponent, TestComponent] });
    TestBed.overrideComponent(TestComponent, { set: { template: html } });
  });

  it("should ...", () => {
    const fixture = TestBed.createComponent(TestComponent);

    fixture.detectChanges();
    expect(fixture.nativeElement.children[0].textContent).toContain("Home Works!");
  });

});

@Component({ selector: "pydt-test", template: "" })
class TestComponent { }
